import type { Dev } from "./dev";
import type { Budget, Rule } from "./guard";
import { knows, type Voice } from "./knows";
import { newId } from "./ids";
import { DAYS, PEOPLE, type Event, type FileItem, type Mail, type Person, type Place } from "./seed";
import type { Task, TaskStep } from "./tasks";

// Understand (plans/ambit-intelligence.md §2.3), scripted: no model runs. A few verbs, matched
// by pattern, each turned into the same plan a model would have to produce. When a key part is
// missing it asks a narrower question instead of guessing.

export type Seen = { events: Event[]; mail: Mail[]; files: FileItem[]; tasks: Task[]; dev?: Dev; modules?: string[]; memory?: string; voice?: Voice };
export type Heard = { kind: "plan"; task: Task } | { kind: "rule"; rule: Rule; read: string } | { kind: "say"; say: string; reveal?: string } | null;

const LATER: [RegExp, string][] = [
  [/^(summari[sz]e|compare)\b/, "Summaries and comparisons come later. Today I can schedule, reply, and tidy Downloads."],
  [/^(watch|remind|tell me when)\b/, "Standing watches and reminders come later. Today I can schedule, reply, and tidy Downloads."],
  [/\b(pay|transfer|buy|sign)\b/, "I never pay, buy or sign. That’s a hard limit. I can prepare it for you to do."],
];

export function understand(text: string, seen: Seen): Heard {
  const t = text.trim().toLowerCase().replace(/[’]/g, "'");
  if (t.length < 4) return null;
  if (/^(always|never|don'?t|do not)\b/.test(t)) return rule(text.trim(), t);
  const back = t.match(/^(?:let me do|i'?ll do|hand back|give me back)\s+(.+?)(?:\s+myself)?\.?$/);
  if (back)
    return {
      kind: "rule",
      rule: { id: newId("rule"), text: `Rohan does ${back[1]}. Ambit helps with what’s needed and doesn’t do it.`, then: "never", used: 0, on: true, source: "said", note: true },
      read: `I’ll stop doing ${back[1]} and leave it to you. I can’t check this one automatically, so it’s a note, listed in Rules.`,
    };
  for (const [re, say] of LATER) if (re.test(t)) return { kind: "say", say };
  if (/^(ship|deploy|release|fix|review)\b/.test(t)) return developer(t, seen);
  if (/\b(tidy|clean up|clean|sort)\b.*\bdownloads\b/.test(t)) return tidy(seen);
  if (/\b(find|schedule|book|set up|arrange|meet|meeting|call|time|min|mins|minutes|hour)\b.*\bwith\b/.test(t)) return schedule(t, seen);
  if (/^(reply|write|email|e-mail|draft|tell|message|answer)\b/.test(t)) return reply(text.trim(), t, seen);
  return null;
}

const personIn = (t: string): Person | undefined => PEOPLE.find((p) => new RegExp(`\\b${p.short.toLowerCase()}\\b`).test(t));
const active = (seen: Seen, id: string) => seen.tasks.find((x) => x.id === id && (x.state === "working" || x.state === "needs"));
const thread = (seen: Seen, p: Person) => seen.mail.find((m) => m.folder === "inbox" && m.from === p.name);

// ── schedule ───────────────────────────────────────────────────────
function schedule(t: string, seen: Seen): Heard {
  const p = personIn(t);
  if (!p) return { kind: "say", say: `Who with? I know ${PEOPLE.map((x) => x.short).join(", ")}.` };
  if (p.short === "Sam" && active(seen, "sam")) return { kind: "say", say: "Already on it: I’m finding 45 minutes with Sam next week.", reveal: "sam" };
  const mins = Number(t.match(/(\d+)\s*(min|minutes|mins)\b/)?.[1] ?? (/\b(an|1|one) hour\b/.test(t) ? 60 : 30));
  const week: 0 | 1 = /\bthis week\b/.test(t) ? 0 : 1;
  // Said beats remembered; remembered beats a default. The memory file is read fresh each time.
  const remembered = !/\b(morning|afternoon)/.test(t) ? knows(seen.memory ?? "", /prefers meetings in the morning/i) : undefined;
  const times = /\bmorning/.test(t) || remembered ? ["9:30", "10:00", "11:00"] : /\bafternoon/.test(t) ? ["14:00", "15:00", "16:00"] : ["10:00", "11:00", "15:00"];
  const free: { day: string; time: string }[] = [];
  for (const day of DAYS.slice(0, 5)) {
    if (week === 0 && DAYS.indexOf(day) <= DAYS.indexOf("Thu")) continue;
    // A slot is free if nothing that day starts within the meeting, or ends inside it (events count as an hour).
    const time = times.find((tm) => !seen.events.some((e) => e.week === week && e.day === day && clash(e.time, tm, mins)));
    if (time) free.push({ day, time });
    if (free.length === 2) break;
  }
  if (!free.length) return { kind: "say", say: `${week ? "Next week" : "The rest of this week"} is full at those times. Here’s the week instead.`, reveal: undefined };
  const when = free.map((f) => `${f.day} ${f.time}`).join(" or ");
  const read = thread(seen, p);
  const draftId = newId("invite");
  const id = newId("task");
  const steps: TaskStep[] = [
    { tool: "calendar.freeBusy", text: `Read your calendar for ${week ? "next week" : "the rest of this week"}` },
    ...(read ? [{ tool: "mail.read" as const, text: `Read “${read.subject}” from ${p.short}` }] : []),
    {
      tool: "calendar.hold",
      text: `Hold ${free.map((f) => `${f.day} ${f.time}`).join(" and ")}`,
      do: { kind: "hold", holds: free.map((f, i) => ({ id: `${id}-h${i}`, week, day: f.day, time: f.time, title: `Hold: ${p.short}, ${mins} min` })) },
    },
    {
      tool: "mail.draft",
      text: `Draft the invite to ${p.short}`,
      do: { kind: "draft", mail: { id: draftId, to: p.name, subject: `${mins} minutes: ${when}?`, body: compose(p, seen, `I’ve held ${free.map((f) => `${f.day} ${f.time}`).join(" and ")} ${week ? "next week" : "this week"} for ${mins} minutes. Which suits you?`) } },
    },
    { tool: "mail.send", text: `Send the invite to ${p.short}`, person: p.name, do: { kind: "send" } },
  ];
  const budget: Budget = { people: [p.name], money: 0, until: week ? "Fri 13 Nov" : "Fri 6 Nov" };
  return {
    kind: "plan",
    task: {
      id,
      intent: t,
      titles: {
        working: `Finding ${mins} min with ${p.short}.`,
        needs: `Invite to ${p.short}, ready to send.`,
        done: `Sent the invite to ${p.short}. You approved it.`,
        dropped: `You dropped the invite to ${p.short}. Nothing was sent.`,
        byHand: `You wrote to ${p.short} yourself. I dropped my invite.`,
      },
      why: `You asked: “${t}”.`,
      sources: ["Calendar · " + (week ? "next week" : "this week"), ...(read ? [`Mail · ${p.name}, “${read.subject}”`] : []), ...(remembered ? [`Memory · “${remembered.text}”`] : [])],
      reads: ["your Calendar", ...(read ? [`Mail from ${p.short}`] : []), ...(remembered ? ["your memory file"] : [])],
      wontTouch: [`${p.short}’s calendar`, `anyone but ${p.short}`],
      steps,
      budget,
      at: 0,
      state: "working",
      draftId,
    },
  };
}

// ── reply ──────────────────────────────────────────────────────────
function reply(raw: string, t: string, seen: Seen): Heard {
  const p = personIn(t);
  if (!p) return { kind: "say", say: `To whom? I know ${PEOPLE.map((x) => x.short).join(", ")}.` };
  // What to say comes after "saying", "that", "to say" or a colon; with "tell", after the name.
  const lower = raw.toLowerCase();
  const cue = lower.match(/\b(saying|that|to say)\b|:/);
  let said = cue ? raw.slice(cue.index! + cue[0].length) : /^(tell|message)\b/i.test(raw) ? raw.slice(lower.indexOf(p.short.toLowerCase()) + p.short.length) : "";
  said = said.trim().replace(/^[,:-]\s*/, "");
  // Guessing what to say would be writing a guess in your voice, so it asks instead.
  if (said.length < 3) return { kind: "say", say: `What should it say to ${p.short}? Try: “reply to ${p.short} saying …”.` };
  const read = thread(seen, p);
  const body = compose(p, seen, sentence(said));
  const draftId = newId("draft");
  return {
    kind: "plan",
    task: {
      id: newId("task"),
      intent: raw,
      titles: {
        working: `Drafting a reply to ${p.short}.`,
        needs: `Reply to ${p.short}, ready to review.`,
        done: `Sent your reply to ${p.short}. You approved it.`,
        dropped: `You dropped my reply to ${p.short}. Nothing was sent.`,
        byHand: `You wrote to ${p.short} yourself. I dropped my draft.`,
      },
      why: `You asked: “${raw}”.`,
      sources: read ? [`Mail · ${p.name}, “${read.subject}”`, `Your voice · how you write to ${p.short}`] : [`Your voice · how you write to ${p.short}`],
      reads: read ? [`Mail from ${p.short}`] : ["nothing else"],
      wontTouch: [`anyone but ${p.short}`],
      steps: [
        ...(read ? [{ tool: "mail.read" as const, text: `Read “${read.subject}”` }] : []),
        { tool: "mail.draft", text: `Draft it in your voice`, do: { kind: "draft", mail: { id: draftId, to: p.name, subject: read ? `Re: ${read.subject}` : "A note", body, re: read?.id } } },
        { tool: "mail.send", text: `Send it to ${p.short}`, person: p.name, do: { kind: "send" } },
      ],
      budget: { people: [p.name], money: 0, until: "Thu 5 Nov" },
      at: 0,
      state: "working",
      draftId,
    },
  };
}

// ── developer (only while the module is on) ───────────────────────
function developer(t: string, seen: Seen): Heard {
  if (!seen.dev || !seen.modules?.includes("developer")) return { kind: "say", say: "That needs the Developer module. Turn it on in Settings › Modules." };
  if (/^review\b/.test(t)) return { kind: "say", say: "Reviews come later. Today I can fix a failing check and ship main." };
  const fixing = seen.tasks.find((x) => x.module === "developer" && (x.state === "working" || x.state === "needs"));
  if (fixing) return { kind: "say", say: "Already on it: the fix for main’s failing check. I ask before merging and before production.", reveal: fixing.id };
  if (/^fix\b/.test(t)) return { kind: "say", say: seen.dev.main.checks === "failing" ? "Main is failing and nothing is fixing it. Open Checks to see why." : "Nothing is failing on main right now." };
  const { main, deploys } = seen.dev;
  if (main.checks === "failing") return { kind: "say", say: "Main’s checks are failing, so I won’t ship it. You can, from Deploys." };
  const behind = deploys.filter((d) => d.sha !== main.sha);
  if (!behind.length) return { kind: "say", say: `Staging and production are already on main (${main.sha}).` };
  return {
    kind: "plan",
    task: {
      id: newId("task"),
      module: "developer",
      intent: t,
      titles: { working: `Shipping ${main.sha}.`, needs: `${main.sha} is on staging. Ready for production?`, done: `${main.sha} is live. You approved production.`, dropped: "You stopped the deploy." },
      why: `You asked: “${t}”.`,
      sources: [`Code · main at ${main.sha}, checks pass`],
      reads: ["main", "the deploys"],
      wontTouch: ["code", "secrets", "anything but staging and production"],
      steps: behind.map((d) =>
        d.env === "staging"
          ? { tool: "deploy.staging" as const, text: `Deploy ${main.sha} to staging`, do: { kind: "deploy" as const, env: "staging" as const } }
          : { tool: "deploy.production" as const, text: `Deploy ${main.sha} to production`, cta: "Deploy to production", do: { kind: "deploy" as const, env: "production" as const } },
      ),
      budget: { people: [], money: 0, until: "Thu 5 Nov" },
      at: 0,
      state: "working",
    },
  };
}

// ── tidy ───────────────────────────────────────────────────────────
function tidy(seen: Seen): Heard {
  if (active(seen, "downloads")) return { kind: "say", say: "Already on it: tidying Downloads is running.", reveal: "downloads" };
  const moves = seen.files
    .filter((f) => f.where === "Downloads")
    .map((f): { id: string; to: Place } | null => {
      if (/\(\d\)\./.test(f.name) || f.kind === "Installer") return { id: f.id, to: "Trash" };
      if (/invoice|receipt/i.test(f.name)) return { id: f.id, to: "Accounts/2026" };
      if (/lease|rent/i.test(f.name)) return { id: f.id, to: "Documents/Home" };
      return null;
    })
    .filter((m) => m !== null);
  if (!moves.length) return { kind: "say", say: "Downloads is already tidy. The rest are photos; I leave those where they are." };
  return {
    kind: "plan",
    task: {
      id: newId("task"),
      intent: "tidy Downloads",
      titles: { working: "Tidying Downloads.", needs: "Tidying Downloads: one move needs you.", done: `Tidied Downloads: moved ${moves.length} files. Each can be put back.` },
      why: "You asked: “tidy Downloads”.",
      sources: ["Files · Downloads"],
      reads: ["Downloads"],
      wontTouch: ["anything outside Downloads", "deleting for good"],
      steps: [
        { tool: "files.read", text: "Sort Downloads by what each file is" },
        { tool: "files.move", text: `Move ${moves.length} files as one batch`, do: { kind: "moves", moves } },
      ],
      budget: { people: [], money: 0, until: "Thu 5 Nov" },
      at: 0,
      state: "working",
    },
  };
}

const at = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
function clash(event: string, slot: string, mins: number) {
  const e = at(event);
  const s = at(slot);
  return s < e + 60 && e < s + mins;
}

function sentence(s: string) {
  const t = s.trim().replace(/\bi\b/g, "I").replace(/\bim\b/gi, "I’m").replace(/'/g, "’");
  return t[0].toUpperCase() + t.slice(1) + (/[.!?]$/.test(t) ? "" : ".");
}

/** A message in your voice for this person: the voice page if there is one, else the default. */
function compose(p: Person, seen: Seen, body: string) {
  const v = seen.voice?.[p.short] ?? p;
  return [v.hi, body, v.bye].filter(Boolean).join(v.hi || v.bye ? "\n\n" : "");
}

// ── rules ──────────────────────────────────────────────────────────
// A sentence becomes a rule only if it maps to a tool, a person or a time the guard can check.
// Otherwise it's kept as a note, and Ambit says plainly that it can't enforce it.
function rule(raw: string, t: string): Heard {
  const then = /^always ask\b/.test(t) ? "ask" : "never";
  const tool = /\b(e-?mail(s|ing)?|mail|send(ing)?|writ(e|ing)|repl(y|ying)|messag(e|ing))\b/.test(t) ? ("mail.send" as const) : /\b(deploy|ship)\b/.test(t) && /\bproduction\b|\bprod\b|\bship\b/.test(t) ? ("deploy.production" as const) : /\bmerge\b/.test(t) ? ("code.merge" as const) : undefined;
  const p = personIn(t.replace(/\banyone\b/, ""));
  const time = t.match(/\bafter (\d{1,2})(?::(\d\d))?\s*(am|pm)?\b/);
  // "after 9" with no am or pm means the evening: that's when rules like this are about.
  const after = time ? `${(Number(time[1]) % 12) + (time[3] !== "am" ? 12 : 0)}:${time[2] ?? "00"}` : undefined;
  const id = newId("rule");
  const text = raw[0].toUpperCase() + raw.slice(1) + (/[.!?]$/.test(raw) ? "" : ".");
  if (!tool || /\b(on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?|weekends?|cc|bcc|nicer|tone)\b/.test(t))
    return { kind: "rule", rule: { id, text, then, used: 0, on: true, source: "said", note: true }, read: "I can’t turn this into something I can check, so I’ll keep it as a note and show it when it’s relevant. I won’t pretend to enforce it." };
  const r: Rule = { id, text, tool, then, used: 0, on: true, source: "said", ...(p && { person: p.name }), ...(after && { after, before: "07:00" }) };
  const what = { "mail.send": "sending email", "deploy.production": "deploying to production", "code.merge": "merging" }[tool as string];
  return { kind: "rule", rule: r, read: `${then === "never" ? "Never" : "Always ask before"} ${what}${p ? ` to ${p.short}` : ""}${after ? ` between ${after} and 07:00` : ""}. The guard checks this before every step.` };
}
