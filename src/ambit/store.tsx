"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import { decide, type Decision as Verdict, type Permission, type Rule } from "./guard";
import { by, plain, type Span } from "./ink";
import { DEV, type Dev } from "./dev";
import { MEMORY, PROPOSALS, RENT, VOICE, type Proposal, type Voice } from "./knows";
import { CALENDAR, FILES, MAIL, NOTES, NOW, PEOPLE, PERSON, type Event, type FileItem, type Mail, type Note, type Place } from "./seed";
import { RULES, SEED_TASKS, ctxFor, type Effect, type Task } from "./tasks";

// The computer as state. You change it by hand through the apps; Ambit changes the same
// state only through task steps, and only after the guard (guard.ts) lets each one through.
// Every change is logged with who made it, and every outward act leaves a receipt. It lives in
// memory only: "Restart the morning" puts the demo week back.

export type Change = { at: string; by: "you" | "ambit"; what: string };
/** What puts things back: older versions to put, new things to remove, settings to restore. */
export type Restore = {
  put: { events: Event[]; files: FileItem[]; mail: Mail[]; notes: Note[]; prs: Dev["prs"]; deploys: Dev["deploys"] };
  remove: { events: string[]; files: string[]; mail: string[]; notes: string[]; prs: number[] };
  fields: Partial<Pick<Computer, "rules" | "permissions" | "memory" | "voice" | "modules">>;
  main?: Dev["main"];
};
// One entry in Activity: one thing done, by whom, and either how to undo it or why it can't be.
export type Entry = { id: string; n: number; at: string; by: "you" | "ambit"; lines: Change[]; task?: string; undo?: Restore; cant?: string; warn?: string; reverted?: boolean };
export type Receipt = { id: string; what: string; to: string; subject: string; by: string; check: string; budget?: string; task?: string; at: string; undo: string };
export type Computer = {
  mail: Mail[];
  events: Event[];
  files: FileItem[];
  notes: Note[];
  dev: Dev;
  modules: string[];
  tasks: Task[];
  receipts: Receipt[];
  // What you've told Ambit, one way or another (step 5): all readable, all yours to change.
  rules: Rule[];
  permissions: Record<string, Permission>;
  memory: string;
  voice: Voice;
  decisions: Record<string, string>;
  proposals: Proposal[];
  paused: boolean;
  log: Change[];
  activity: Entry[];
};

export type Action =
  | { type: "mail.read"; id: string }
  | { type: "mail.save"; mail: Mail }
  | { type: "mail.send"; mail: Mail }
  | { type: "mail.discard"; id: string }
  | { type: "event.add"; event: Event }
  | { type: "event.remove"; id: string }
  | { type: "file.rename"; id: string; name: string }
  | { type: "file.move"; id: string; to: Place }
  | { type: "file.restore"; id: string }
  | { type: "note.save"; note: Note }
  | { type: "note.remove"; id: string }
  | { type: "task.add"; task: Task }
  | { type: "task.tick" }
  | { type: "pause.toggle" }
  | { type: "draft.edit"; id: string; ink: Span[] }
  | { type: "draft.send"; id: string }
  | { type: "draft.drop"; id: string }
  | { type: "task.approve"; id: string }
  | { type: "task.stop"; id: string }
  | { type: "module.toggle"; id: string }
  | { type: "dev.merge"; n: number }
  | { type: "dev.rerun"; id: string }
  | { type: "dev.deploy"; env: "staging" | "production" }
  | { type: "task.skip"; id: string }
  | { type: "decision.choose"; id: string; pos: string; rule: boolean }
  | { type: "rule.add"; rule: Rule }
  | { type: "rule.toggle"; id: string }
  | { type: "rule.remove"; id: string }
  | { type: "perm.set"; app: string; level: Permission }
  | { type: "memory.set"; text: string }
  | { type: "voice.set"; who: string; hi: string; bye: string }
  | { type: "proposal.accept"; id: string }
  | { type: "proposal.dismiss"; id: string }
  | { type: "revert"; ids: string[] }
  | { type: "task.takeover"; id: string }
  | { type: "task.finish"; id: string; name: string; phone: string };

export const START: Computer = {
  mail: MAIL.map((m) => (m.author === "ambit" ? { ...m, ink: by(m.body, "ambit") } : m)),
  events: CALENDAR,
  files: FILES,
  notes: NOTES,
  dev: DEV,
  modules: ["developer"],
  tasks: SEED_TASKS,
  receipts: [],
  rules: RULES,
  permissions: {},
  memory: MEMORY,
  voice: VOICE,
  decisions: {},
  proposals: PROPOSALS,
  paused: false,
  log: [],
  activity: [],
};

type Say = (who: Change["by"], what: string) => void;
/** Lower-case the first letter only, so names in a step ("Sam", "#143") stay as written. */
const lc = (t: string) => t[0].toLowerCase() + t.slice(1);

export function apply(s: Computer, a: Action, say: Say): Computer {
  const name = (id: string) => s.files.find((f) => f.id === id)?.name;
  switch (a.type) {
    case "mail.read":
      return { ...s, mail: s.mail.map((m) => (m.id === a.id ? { ...m, unread: false } : m)) };
    case "mail.save":
      say("you", `Saved a draft to ${a.mail.to || "no one yet"}`);
      return upsert(s, "mail", a.mail);
    case "mail.send": {
      say("you", `Sent “${a.mail.subject}” to ${a.mail.to}`);
      // Answering a thread yourself makes Ambit's reply to that thread unnecessary. Anything else
      // it drafted stays: it can't tell whether your message covers it, so you decide.
      const stale = s.mail.filter((m) => m.author === "ambit" && m.folder === "drafts" && m.re && m.re === a.mail.re);
      stale.forEach((m) => say("ambit", `Dropped my draft to ${m.to}: you wrote yourself`));
      const tasks = s.tasks.map((t) => (stale.some((m) => m.id === t.draftId) ? { ...t, state: "done" as const, outcome: "byHand" as const, stopped: undefined } : t));
      const next = sent({ ...s, tasks, mail: s.mail.filter((m) => !stale.includes(m)) }, a.mail);
      return receipt(next, mailed(a.mail), "you, by hand", "your own message");
    }
    case "mail.discard":
      say("you", "Discarded a draft");
      return { ...s, mail: s.mail.filter((m) => m.id !== a.id) };
    case "event.add":
      say("you", `Added “${a.event.title}”, ${a.event.day} ${a.event.time}`);
      return { ...s, events: [...s.events, a.event] };
    case "event.remove":
      say("you", `Removed “${s.events.find((e) => e.id === a.id)?.title}”`);
      return { ...s, events: s.events.filter((e) => e.id !== a.id) };
    case "file.rename":
      say("you", `Renamed ${name(a.id)} to ${a.name}`);
      return { ...s, files: s.files.map((f) => (f.id === a.id ? { ...f, name: a.name } : f)) };
    case "file.move":
      say("you", `Moved ${name(a.id)} to ${a.to}`);
      return move(s, a.id, a.to);
    case "file.restore":
      say("you", `Put back ${name(a.id)}`);
      return { ...s, files: s.files.map((f) => (f.id === a.id && f.was ? { ...f, where: f.was, was: undefined } : f)) };
    case "note.save":
      say("you", `Edited the note “${a.note.title}”`);
      return upsert(s, "notes", a.note);
    case "note.remove":
      say("you", `Deleted the note “${s.notes.find((n) => n.id === a.id)?.title}”`);
      return { ...s, notes: s.notes.filter((n) => n.id !== a.id) };
    case "task.add":
      say("you", `Handed off: “${a.task.intent}”`);
      return { ...s, tasks: [a.task, ...s.tasks] };
    case "pause.toggle":
      say("you", s.paused ? "Resumed all tasks" : "Paused all tasks");
      return { ...s, paused: !s.paused };
    case "task.tick":
      // A task from a module that's off waits for it to come back on; it isn't declined.
      return s.paused ? s : s.tasks.reduce((acc, t) => (t.state === "working" && (!t.module || s.modules.includes(t.module)) ? step(acc, t.id, say) : acc), s);
    case "task.approve": {
      const t = s.tasks.find((x) => x.id === a.id);
      if (!t || t.state !== "needs") return s;
      if (t.steps[t.at].tool === "mail.send" && t.draftId) return apply(s, { type: "draft.send", id: t.draftId }, say);
      return approve(s, t, say);
    }
    case "task.stop": {
      const t = s.tasks.find((x) => x.id === a.id);
      say("you", `Stopped: ${t?.titles.working}`);
      return { ...s, tasks: s.tasks.map((x) => (x.id === a.id ? { ...x, state: "done", outcome: "dropped", stopped: undefined } : x)) };
    }
    case "module.toggle": {
      const on = s.modules.includes(a.id);
      say("you", `Turned the ${a.id} module ${on ? "off" : "on"}`);
      return { ...s, modules: on ? s.modules.filter((m) => m !== a.id) : [...s.modules, a.id] };
    }
    case "dev.merge": {
      const pr = s.dev.prs.find((p) => p.n === a.n);
      if (!pr) return s;
      say("you", `Merged #${pr.n} into main`);
      const next = merge(s, pr.n);
      return receipt(next, { what: `Merged #${pr.n} into main`, to: "main · teammates see it", subject: pr.title, undo: REVERT }, "you, by hand", "your own change");
    }
    case "dev.rerun": {
      const r = s.dev.runs.find((x) => x.id === a.id);
      if (!r) return s;
      say("you", `Re-ran ${r.name} on ${r.target}`);
      // The nightly failure is real, so running it again fails again until the fix is in.
      const fails = r.target === "main" && s.dev.main.checks === "failing";
      return run(s, { target: r.target, name: r.name, state: fails ? "failed" : "passed", by: "you", log: fails ? r.log : "All passed." });
    }
    case "dev.deploy": {
      say("you", `Deployed main to ${a.env}`);
      const next = deploy(s, a.env, "you");
      return a.env === "production" ? receipt(next, shipped(s), "you, by hand", "your own change") : next;
    }
    case "draft.edit": {
      const m = s.mail.find((x) => x.id === a.id);
      say("you", `Edited Ambit’s draft to ${m?.to}`);
      const next = { ...s, mail: s.mail.map((x) => (x.id === a.id ? { ...x, ink: a.ink, body: plain(a.ink) } : x)) };
      // A correction becomes a proposal, never a silent change (plans/ambit-intelligence.md §2.6).
      const who = PEOPLE.find((p) => p.name === m?.to)?.short;
      const bye = who && s.voice[who]?.bye;
      if (!m || !who || !bye || !m.body.includes(bye) || plain(a.ink).includes(bye) || s.proposals.some((p) => p.id === `voice-${who}`)) return next;
      say("ambit", `Noticed you removed “${bye.replace("\n", " ")}” to ${who}`);
      const p: Proposal = { id: `voice-${who}`, kind: "voice", text: `You removed “${bye.replace("\n", " ")}” from my draft to ${who}. Stop signing off that way to ${who}?`, why: `I write to ${who} the way your voice page says. Change it once here, or edit it there.`, yes: "Yes, update my voice", no: "No, just this once" };
      return { ...next, proposals: [p, ...next.proposals] };
    }
    case "draft.send": {
      const m = s.mail.find((x) => x.id === a.id);
      const t = s.tasks.find((x) => x.draftId === a.id);
      if (!m || !t) return s;
      const d = decide(t.steps[t.at], ctxFor(t, s, NOW.time));
      // Approving can answer "ask first". It can't answer "never".
      if (d.level === "never") {
        say("ambit", `Couldn’t send to ${m.to}: ${d.check}`);
        return { ...s, tasks: s.tasks.map((x) => (x.id === t.id ? { ...x, state: "declined", stopped: d } : x)) };
      }
      say("you", `Approved sending “${m.subject}” to ${m.to}`);
      say("ambit", `Sent “${m.subject}” to ${m.to}`);
      const next = sent(s, m);
      // Sending can be a middle step (an invite, then the other side's reply); the task carries on.
      const at = t.at + 1;
      const end = at >= t.steps.length;
      const tasks = next.tasks.map((x) => (x.id === t.id ? { ...x, at, state: end ? ("done" as const) : ("working" as const), outcome: end ? ("sent" as const) : undefined, stopped: undefined } : x));
      return receipt({ ...next, tasks }, mailed(m), "Ambit, approved by you", d.check, t);
    }
    case "task.skip": {
      const t = s.tasks.find((x) => x.id === a.id);
      if (!t || t.state !== "needs") return s;
      say("you", `Said no to: ${lc(t.steps[t.at].text)}`);
      const at = t.at + 1;
      return { ...s, tasks: s.tasks.map((x) => (x.id === t.id ? { ...x, at, stopped: undefined, state: at >= x.steps.length ? "done" : "working", outcome: at >= x.steps.length ? "sent" : undefined } : x)) };
    }
    case "decision.choose": {
      const pos = RENT.positions.find((p) => p.id === a.pos);
      if (a.id !== RENT.id || !pos) return s;
      say("you", `Decided: ${pos.label.toLowerCase()} (${RENT.question})`);
      const draftId = "rent-reply";
      const task: Task = {
        id: "rent-reply",
        intent: `${pos.label}: reply to Mark`,
        titles: { working: "Drafting your answer to Mark.", needs: "Your answer to Mark, ready to review.", done: "Sent your answer to Mark. You approved it.", dropped: "You dropped the answer to Mark. Nothing was sent." },
        why: `You chose “${pos.label}”. The reply says only that.`,
        sources: ["Mail · Mark D’Souza, “Lease renewal”", ...pos.pros.concat(pos.cons).flatMap((x) => (x.source ? [x.source] : []))],
        reads: ["Mark’s email"],
        wontTouch: ["anyone but Mark", "paying or signing anything"],
        budget: { people: [RENT.to], money: 0, until: "Fri 6 Nov" },
        steps: [
          { tool: "mail.read", text: "Read Mark’s email again" },
          { tool: "mail.draft", text: "Draft your answer", do: { kind: "draft", mail: { id: draftId, to: RENT.to, subject: "Re: Lease renewal: rent from January", body: pos.reply, re: RENT.mail } } },
          { tool: "mail.send", text: "Send it to Mark", person: RENT.to, do: { kind: "send" } },
        ],
        at: 0,
        state: "working",
      };
      const rule: Rule | null = a.rule ? { id: `chosen-${RENT.id}`, text: pos.rule, then: "ask", used: 0, on: true, source: "chosen", note: true } : null;
      if (rule) say("you", `Made a rule: ${rule.text}`);
      return { ...s, decisions: { ...s.decisions, [a.id]: a.pos }, tasks: [task, ...s.tasks], rules: rule ? [...s.rules.filter((r) => r.id !== rule.id), rule] : s.rules };
    }
    case "rule.add":
      say("you", `Made a rule: ${a.rule.text}`);
      return { ...s, rules: [...s.rules, a.rule] };
    case "rule.toggle": {
      const r = s.rules.find((x) => x.id === a.id);
      say("you", `Turned ${r?.on ? "off" : "on"} the rule “${r?.text}”`);
      return { ...s, rules: s.rules.map((x) => (x.id === a.id ? { ...x, on: !x.on } : x)) };
    }
    case "rule.remove":
      say("you", `Deleted the rule “${s.rules.find((x) => x.id === a.id)?.text}”`);
      return { ...s, rules: s.rules.filter((x) => x.id !== a.id) };
    case "perm.set":
      say("you", `Set ${a.app} to “${a.level}”`);
      return { ...s, permissions: { ...s.permissions, [a.app]: a.level } };
    case "memory.set":
      say("you", "Edited the memory file");
      return { ...s, memory: a.text };
    case "voice.set":
      say("you", `Changed how Ambit writes to ${a.who}`);
      return { ...s, voice: { ...s.voice, [a.who]: { ...s.voice[a.who], hi: a.hi, bye: a.bye } } };
    case "proposal.accept": {
      const p = s.proposals.find((x) => x.id === a.id);
      if (!p) return s;
      const rest = { ...s, proposals: s.proposals.filter((x) => x.id !== a.id) };
      if (p.kind === "skill") {
        say("you", "Took the weekly report back");
        const note: Note = {
          id: "report",
          title: "Weekly report, 5 Nov",
          body: "What shipped:\n\nWhat’s stuck:\n\nNext week:\n\n(The week’s numbers, from Ambit: 1 fix merged and live, 3 emails answered, 5 files tidied.)",
          when: "now",
          author: "you",
        };
        const rule: Rule = { id: "skill-report", text: "Rohan writes the weekly report. Ambit gives the numbers and doesn’t draft it.", then: "never", used: 0, on: true, source: "chosen", note: true };
        return { ...rest, notes: [note, ...s.notes.filter((n) => n.id !== "report")], rules: [...s.rules.filter((r) => r.id !== rule.id), rule] };
      }
      if (p.kind === "voice") {
        const who = p.id.replace("voice-", "");
        say("you", `Stopped signing off to ${who}`);
        return { ...rest, voice: { ...s.voice, [who]: { ...s.voice[who], bye: "" } } };
      }
      say("you", "Let Ambit merge in Code and tell you after");
      // Raising trust is your act, so it leaves a receipt like anything else that matters.
      return receipt({ ...rest, permissions: { ...s.permissions, code: "act" } }, { what: "Allowed: merge, then tell me", to: "Settings › Autonomy · Code", subject: p.text, undo: "Take it back any time in Settings › Autonomy. Production deploys still ask." }, "you", "your choice");
    }
    case "proposal.dismiss":
      say("you", "Said no to a proposal");
      return { ...s, proposals: s.proposals.filter((x) => x.id !== a.id) };
    case "task.takeover": {
      const t = s.tasks.find((x) => x.id === a.id);
      say("you", `Took over: ${t?.titles.working}`);
      return { ...s, tasks: s.tasks.map((x) => (x.id === a.id ? { ...x, held: true } : x)) };
    }
    case "task.finish": {
      const t = s.tasks.find((x) => x.id === a.id);
      if (!t?.held) return s;
      say("you", "Paid the ₹500 deposit and booked Olive, Fri 18:30, 4 people");
      const next = {
        ...s,
        events: s.events.map((e) => (e.id === "e3" ? { ...e, title: "Dinner at Olive, 4 people (booked)" } : e)),
        tasks: s.tasks.map((x) => (x.id === a.id ? { ...x, state: "done" as const, outcome: "byHand" as const, stopped: undefined, at: x.steps.length } : x)),
      };
      return receipt(next, { what: "Paid a deposit and booked", to: "Olive, Indiranagar", subject: `Table for 4, Fri 18:30 · ₹500 · ${a.name}, ${a.phone}`, undo: "Olive refunds the deposit if you cancel 24 hours ahead. That’s their policy, not an undo." }, "you, by hand", "you took over; Ambit never pays");
    }
    case "revert":
      return revert(s, a.ids, say);
    case "draft.drop": {
      const m = s.mail.find((x) => x.id === a.id);
      say("you", `Dropped Ambit’s draft to ${m?.to}`);
      return {
        ...s,
        mail: s.mail.filter((x) => x.id !== a.id),
        tasks: s.tasks.map((x) => (x.draftId === a.id ? { ...x, state: "done", outcome: "dropped", stopped: undefined } : x)),
      };
    }
  }
}

/** Run one task's next step through the guard, and do it if allowed. */
function step(s: Computer, id: string, say: Say): Computer {
  const t = s.tasks.find((x) => x.id === id)!;
  const st = t.steps[t.at];
  const set = (to: Partial<Task>) => ({ ...s, tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...to } : x)) });
  if (!st) return set({ state: "done" });
  // A deploy that's already been done (by you, meanwhile) is skipped, not asked about.
  if (st.do?.kind === "deploy" && s.dev.deploys.find((x) => x.env === (st.do as { env: string }).env)?.sha === s.dev.main.sha) {
    say("ambit", `Skipped: ${lc(st.text)}. It’s already there.`);
    const at = t.at + 1;
    return set({ at, state: at >= t.steps.length ? "done" : "working" });
  }
  const d = decide(st, ctxFor(t, s, NOW.time));
  if (d.level === "never" && st.handover) {
    say("ambit", `Stopped before: ${lc(st.text)} (${d.check}). It’s yours to finish.`);
    return set({ state: "needs", stopped: d });
  }
  if (d.level === "never") {
    say("ambit", `Didn’t: ${lc(st.text)} (${d.check})`);
    return counted({ ...s, tasks: s.tasks.map((x) => (x.id === id ? { ...x, state: "declined", stopped: d } : x)) }, d);
  }
  if (d.level === "ask") {
    say("ambit", `Waiting for you: ${lc(st.text)}`);
    return counted(set({ state: "needs", stopped: d }), d);
  }
  say("ambit", st.text);
  const done = perform(s, st.do, say, id);
  const at = t.at + 1;
  const draftId = st.do?.kind === "draft" ? st.do.mail.id : t.draftId;
  return { ...done, tasks: done.tasks.map((x) => (x.id === id ? { ...x, at, draftId, state: at >= x.steps.length ? "done" : "working" } : x)) };
}

function perform(s: Computer, e: Effect | undefined, say: Say, task?: string): Computer {
  if (!e) return s;
  if (e.kind === "agent") {
    // The other agent's words go in the exchange as content. A request inside them is refused,
    // and the refusal is written down where you can see it.
    e.messages.filter((m) => m.refused).forEach((m) => say("ambit", m.refused!));
    const lines = e.messages.flatMap((m) => (m.refused ? [m, { from: "guard" as const, who: "Guard", text: m.refused }] : [m]));
    return { ...s, tasks: s.tasks.map((t) => (t.id === task ? { ...t, exchange: [...(t.exchange ?? []), ...lines] } : t)) };
  }
  if (e.kind === "confirm") return { ...s, events: s.events.filter((x) => !e.release.includes(x.id)).map((x) => (x.id === e.keep ? { ...x, title: e.title, tentative: false } : x)) };
  if (e.kind === "addPerson") return { ...s, events: s.events.map((x) => (x.id === e.event ? { ...x, title: e.title } : x)) };
  if (e.kind === "hold") return { ...s, events: [...s.events, ...e.holds.filter((h) => !s.events.some((x) => x.id === h.id)).map((h) => ({ ...h, author: "ambit" as const, tentative: true }))] };
  if (e.kind === "draft")
    return upsert(s, "mail", { ...e.mail, folder: "drafts", from: PERSON.first, when: NOW.time, author: "ambit", ink: by(e.mail.body, "ambit") });
  if (e.kind === "moves") {
    e.moves.forEach((m) => say("ambit", `Moved ${s.files.find((f) => f.id === m.id)?.name} to ${m.to}`));
    return e.moves.reduce((acc, m) => move(acc, m.id, m.to, "ambit"), s);
  }
  if (e.kind === "pr") return s.dev.prs.some((p) => p.n === e.pr.n) ? s : { ...s, dev: { ...s.dev, prs: [{ ...e.pr, when: NOW.time }, ...s.dev.prs] } };
  if (e.kind === "run") {
    const prs = s.dev.prs.map((p) => (p.n === e.pr ? { ...p, checks: "passing" as const } : p));
    return run({ ...s, dev: { ...s.dev, prs } }, { target: `#${e.pr}`, name: "pull request", state: "passed", by: "ambit", log: "213 passed. dates.test.ts passes in Asia/Kolkata and in UTC." });
  }
  if (e.kind === "merge") return merge(s, e.pr);
  if (e.kind === "deploy") return deploy(s, e.env, "ambit");
  return s;
}

/** Do a step the guard asked about, now that you've approved it. Approving can't answer "never". */
function approve(s: Computer, t: Task, say: Say): Computer {
  const st = t.steps[t.at];
  const d = decide(st, ctxFor(t, s, NOW.time));
  if (d.level === "never") {
    say("ambit", `Couldn’t: ${lc(st.text)} (${d.check})`);
    return { ...s, tasks: s.tasks.map((x) => (x.id === t.id ? { ...x, state: "declined", stopped: d } : x)) };
  }
  say("you", `Approved: ${lc(st.text)}`);
  say("ambit", st.text);
  let next = perform(s, st.do, say, t.id);
  if (st.do?.kind === "merge") {
    const pr = s.dev.prs.find((p) => p.n === (st.do as { pr: number }).pr);
    next = receipt(next, { what: `Merged #${pr?.n} into main`, to: "main · teammates see it", subject: pr?.title ?? "", undo: REVERT }, "Ambit, approved by you", d.check, t);
  }
  if (st.do?.kind === "deploy" && st.do.env === "production") next = receipt(next, shipped(s), "Ambit, approved by you", d.check, t);
  const at = t.at + 1;
  return { ...next, tasks: next.tasks.map((x) => (x.id === t.id ? { ...x, at, stopped: undefined, state: at >= x.steps.length ? "done" : "working", outcome: at >= x.steps.length ? "sent" : undefined } : x)) };
}

/** Count a rule each time it decides something, so the Rules page shows which ones matter. */
function counted(s: Computer, d: Verdict): Computer {
  if (!d.check.startsWith("your rule")) return s;
  return { ...s, rules: s.rules.map((r) => (d.check.endsWith(r.text) ? { ...r, used: r.used + 1 } : r)) };
}

const SHA: Record<number, string> = { 143: "c07d3b2", 139: "7e4a1f9" };
const REVERT = "Revert it in one click. Teammates will see the merge and the revert.";
const shipped = (s: Computer) => ({
  what: "Deployed to production",
  to: "production · customers",
  subject: `${s.dev.main.sha}: ${s.dev.main.what}`,
  undo: `Roll back to ${s.dev.deploys.find((d) => d.env === "production")?.sha} in one click. Anyone who used it in between saw this version.`,
});
const mailed = (m: Mail) => ({ what: "Email sent", to: m.to, subject: m.subject, undo: "Can’t be taken back. You can write again to correct it." });

function run(s: Computer, r: Omit<Dev["runs"][number], "id" | "when">): Computer {
  return { ...s, dev: { ...s.dev, runs: [{ ...r, id: `run-${s.dev.runs.length + 1}`, when: NOW.time }, ...s.dev.runs] } };
}

function merge(s: Computer, n: number): Computer {
  const pr = s.dev.prs.find((p) => p.n === n);
  if (!pr) return s;
  // The nightly failure is in a test; merging the PR that fixes it is what turns main green.
  const fixes = pr.checks === "passing" && s.dev.main.checks === "failing" && pr.by === "ambit";
  const main = { sha: SHA[n] ?? `${n}e4a1f9`.slice(0, 7), what: `Merge #${n}: ${pr.title}`, checks: fixes ? ("passing" as const) : s.dev.main.checks };
  const merged = { ...s, dev: { ...s.dev, main, prs: s.dev.prs.map((p) => (p.n === n ? { ...p, state: "merged" as const } : p)) } };
  return fixes ? run(merged, { target: "main", name: "after merge", state: "passed", by: "app", log: "213 passed." }) : merged;
}

function deploy(s: Computer, env: "staging" | "production", by: "you" | "ambit"): Computer {
  const before = s.dev.deploys.find((d) => d.env === env)!;
  const now = { env, sha: s.dev.main.sha, what: s.dev.main.what, when: `${NOW.weekday} ${NOW.time}`, by };
  return { ...s, dev: { ...s.dev, history: [before, ...s.dev.history], deploys: s.dev.deploys.map((d) => (d.env === env ? now : d)) } };
}

function sent(s: Computer, m: Mail): Computer {
  const out = { ...m, folder: "sent" as const, when: NOW.time };
  // Answering a message clears what it was waiting on.
  const mail = s.mail.map((x) => (x.id === m.re ? { ...x, tag: undefined } : x));
  return upsert({ ...s, mail }, "mail", out);
}

function receipt(s: Computer, out: { what: string; to: string; subject: string; undo: string }, who: string, check: string, t?: Task): Computer {
  const r: Receipt = {
    id: `r-${s.receipts.length + 1}`,
    ...out,
    by: who,
    check,
    budget: t && `people: ${t.budget.people.join(", ") || "none"} · money: ${t.budget.money ? `₹${t.budget.money}` : "none"} · by ${t.budget.until}`,
    task: t && `“${t.intent}”`,
    at: `${NOW.day} ${NOW.time}`,
  };
  return { ...s, receipts: [r, ...s.receipts] };
}

function move(s: Computer, id: string, to: Place, movedBy?: "ambit"): Computer {
  return { ...s, files: s.files.map((f) => (f.id === id ? { ...f, where: to, was: to === "Trash" ? f.where : undefined, movedBy } : f)) };
}

function upsert<K extends "mail" | "notes">(s: Computer, key: K, item: Computer[K][number]): Computer {
  const list = s[key] as { id: string }[];
  const next = list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];
  return { ...s, [key]: next };
}

export function reduce(s: Computer, a: Action): Computer {
  // Each task's step is its own entry in Activity, so one task can be undone without another.
  if (a.type === "task.tick") {
    if (s.paused) return s;
    return s.tasks.reduce((acc, t) => (t.state === "working" && (!t.module || acc.modules.includes(t.module)) ? record(acc, (say) => step(acc, t.id, say), t.id) : acc), s);
  }
  return record(s, (say) => apply(s, a, say), taskOf(s, a));
}

function taskOf(s: Computer, a: Action) {
  if ("id" in a && typeof a.id === "string") return s.tasks.find((t) => t.id === a.id || t.draftId === a.id)?.id;
  if (a.type === "task.add") return a.task.id;
}

/** Do something, log it, and write it to Activity with its undo, worked out from what changed. */
function record(s: Computer, run: (say: Say) => Computer, task?: string): Computer {
  const lines: Change[] = [];
  const next = run((who, what) => lines.push({ at: NOW.time, by: who, what }));
  if (!lines.length) return next;
  const log = [...lines].reverse().concat(next.log);
  const sent = next.receipts.length > s.receipts.length ? next.receipts[0] : undefined;
  // What went out can't be taken back by putting things as they were. Say so instead.
  const cant = sent?.undo.startsWith("Can’t") || sent?.what.startsWith("Paid") ? sent.undo : undefined;
  const entry: Entry = {
    id: `a-${next.activity.length + 1}`,
    n: next.activity.length + 1,
    at: NOW.time,
    by: lines.some((l) => l.by === "ambit") ? "ambit" : "you",
    lines,
    task,
    undo: cant ? undefined : inverse(s, next),
    cant,
    warn: !cant && sent ? sent.undo : undefined,
  };
  return { ...next, log, activity: [entry, ...next.activity] };
}

const byId = <T,>(list: T[], key: (x: T) => string | number) => new Map(list.map((x) => [key(x), x]));
function inverse(before: Computer, after: Computer): Restore | undefined {
  const r: Restore = { put: { events: [], files: [], mail: [], notes: [], prs: [], deploys: [] }, remove: { events: [], files: [], mail: [], notes: [], prs: [] }, fields: {} };
  const diff = <T,>(was: T[], now: T[], key: (x: T) => string | number, put: T[], remove: (string | number)[]) => {
    const old = byId(was, key);
    const cur = byId(now, key);
    old.forEach((x, k) => cur.get(k) !== x && put.push(x));
    cur.forEach((_, k) => !old.has(k) && remove.push(k));
  };
  diff(before.events, after.events, (x) => x.id, r.put.events, r.remove.events);
  diff(before.files, after.files, (x) => x.id, r.put.files, r.remove.files);
  diff(before.mail, after.mail, (x) => x.id, r.put.mail, r.remove.mail);
  diff(before.notes, after.notes, (x) => x.id, r.put.notes, r.remove.notes);
  diff(before.dev.prs, after.dev.prs, (x) => x.n, r.put.prs, r.remove.prs);
  diff(before.dev.deploys, after.dev.deploys, (x) => x.env, r.put.deploys, []);
  (["rules", "permissions", "memory", "voice", "modules"] as const).forEach((k) => before[k] !== after[k] && Object.assign(r.fields, { [k]: before[k] }));
  if (before.dev.main !== after.dev.main) r.main = before.dev.main;
  const empty = !Object.values(r.put).some((x) => x.length) && !Object.values(r.remove).some((x) => x.length) && !Object.keys(r.fields).length && !r.main;
  return empty ? undefined : r;
}

function restore(s: Computer, r: Restore): Computer {
  const merge = <T,>(list: T[], put: T[], remove: (string | number)[], key: (x: T) => string | number) => {
    const swap = byId(put, key);
    const kept = list.filter((x) => !remove.includes(key(x))).map((x) => swap.get(key(x)) ?? x);
    return [...put.filter((x) => !kept.some((k) => key(k) === key(x))), ...kept];
  };
  return {
    ...s,
    ...r.fields,
    events: merge(s.events, r.put.events, r.remove.events, (x) => x.id),
    files: merge(s.files, r.put.files, r.remove.files, (x) => x.id),
    mail: merge(s.mail, r.put.mail, r.remove.mail, (x) => x.id),
    notes: merge(s.notes, r.put.notes, r.remove.notes, (x) => x.id),
    dev: { ...s.dev, main: r.main ?? s.dev.main, prs: merge(s.dev.prs, r.put.prs, r.remove.prs, (x) => x.n), deploys: merge(s.dev.deploys, r.put.deploys, [], (x) => x.env) },
  };
}

/** Revert entries, newest first. Anything that can't be undone is skipped and stays marked. */
function revert(s: Computer, ids: string[], say: Say): Computer {
  const chosen = s.activity.filter((e) => ids.includes(e.id) && !e.reverted && e.undo);
  if (!chosen.length) return s;
  let next = s;
  for (const e of chosen) next = restore(next, e.undo!);
  chosen.forEach((e) => say("you", `Reverted: ${e.lines[e.lines.length - 1].what}`));
  const done = new Set(chosen.map((e) => e.id));
  const activity = next.activity.map((e) => (done.has(e.id) ? { ...e, reverted: true } : e));
  // A task whose every reversible entry is reverted says so in Today.
  const tasks = next.tasks.map((t) => {
    const mine = activity.filter((e) => e.task === t.id && e.undo);
    return mine.length && mine.every((e) => e.reverted) ? { ...t, undone: true } : t;
  });
  return { ...next, activity, tasks };
}

const Ctx = createContext<{ state: Computer; act: (a: Action) => void } | null>(null);
// How long a step takes. Slow enough to watch, so the morning has something to see.
const STEP_MS = 3500;

export function ComputerProvider({ children }: { children: React.ReactNode }) {
  const [state, act] = useReducer(reduce, START);
  const running = !state.paused && state.tasks.some((t) => t.state === "working" && (!t.module || state.modules.includes(t.module)));
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => act({ type: "task.tick" }), STEP_MS);
    return () => window.clearTimeout(t);
  }, [running, state.tasks]);
  return <Ctx.Provider value={{ state, act }}>{children}</Ctx.Provider>;
}

export function useComputer() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useComputer outside ComputerProvider");
  return c;
}

export { newId } from "./ids";
