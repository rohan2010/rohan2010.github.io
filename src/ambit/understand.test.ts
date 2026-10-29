import { describe, expect, it } from "vitest";
import { DEV } from "./dev";
import { CALENDAR, FILES, MAIL } from "./seed";
import { SEED_TASKS } from "./tasks";
import { understand, type Seen } from "./understand";

const seen = (over: Partial<Seen> = {}): Seen => ({ events: CALENDAR, mail: MAIL, files: FILES, tasks: SEED_TASKS, dev: DEV, modules: ["developer"], ...over });
const plan = (text: string, s = seen()) => {
  const h = understand(text, s);
  if (h?.kind !== "plan") throw new Error(`no plan for “${text}”: ${JSON.stringify(h)}`);
  return h.task;
};
const say = (text: string, s = seen()) => {
  const h = understand(text, s);
  if (h?.kind !== "say") throw new Error(`expected a question for “${text}”, got ${h?.kind}`);
  return h;
};

describe("understanding: schedule", () => {
  it.each([
    "45 min with Priya next week, mornings",
    "find a time with Priya",
    "schedule a call with Meera",
    "book 30 minutes with Mark next week",
    "set up a meeting with Dad",
    "find time with priya this week",
  ])("plans “%s”", (text) => {
    const t = plan(text);
    expect(t.steps.at(-1)?.tool).toBe("mail.send");
    expect(t.budget.people).toHaveLength(1);
    expect(t.budget.money).toBe(0);
  });

  it("holds mornings that don’t clash, and only reaches that person", () => {
    const t = plan("45 min with Priya next week, mornings");
    const hold = t.steps.find((s) => s.tool === "calendar.hold")!.do;
    if (hold?.kind !== "hold") throw new Error("no holds");
    expect(hold.holds).toHaveLength(2);
    for (const h of hold.holds) {
      expect(Number(h.time.split(":")[0])).toBeLessThan(12);
      const mins = (x: string) => Number(x.split(":")[0]) * 60 + Number(x.split(":")[1]);
      // Nothing that day may overlap the 45 minutes (other events count as an hour).
      expect(CALENDAR.some((e) => e.week === h.week && e.day === h.day && mins(h.time) < mins(e.time) + 60 && mins(e.time) < mins(h.time) + 45)).toBe(false);
    }
    expect(t.budget.people).toEqual(["Priya Rao"]);
    expect(t.steps.at(-1)?.person).toBe("Priya Rao");
  });

  it("points to the Sam task instead of starting it twice", () => {
    expect(say("find a time with Sam").reveal).toBe("sam");
  });

  it("asks who, rather than guessing a person", () => {
    expect(say("find a time with Zed").say).toMatch(/who/i);
  });
});

describe("understanding: reply", () => {
  it.each([
    ["reply to Dad saying i'll come on Sunday", "I’ll come on Sunday."],
    ["tell Dad I’ll be there by 12", "I’ll be there by 12."],
    ["email Meera saying are you free in December?", "Are you free in December?"],
    ["write to Mark that I need till Monday to decide", "I need till Monday to decide."],
    ["reply to Priya: 3 works, see you then", "3 works, see you then."],
  ])("drafts “%s”", (text, words) => {
    const t = plan(text);
    const draft = t.steps.find((s) => s.tool === "mail.draft")!.do;
    if (draft?.kind !== "draft") throw new Error("no draft");
    expect(draft.mail.body).toContain(words);
    expect(t.steps.at(-1)?.tool).toBe("mail.send");
  });

  it("writes in the voice for each person", () => {
    const mark = plan("write to Mark that I need till Monday").steps.find((s) => s.tool === "mail.draft")!.do;
    const dad = plan("reply to Dad saying yes").steps.find((s) => s.tool === "mail.draft")!.do;
    if (mark?.kind !== "draft" || dad?.kind !== "draft") throw new Error("no draft");
    expect(mark.mail.body.startsWith("Hi Mark,")).toBe(true);
    expect(mark.mail.body).toContain("Regards,");
    expect(dad.mail.body).toBe("Yes.");
  });

  it("asks what to say instead of writing a guess in your voice", () => {
    expect(say("reply to Dad").say).toMatch(/what should it say/i);
    expect(say("email Priya").say).toMatch(/what should it say/i);
  });
});

describe("understanding: tidy and the rest", () => {
  it("doesn’t start a second tidy while one is running", () => {
    expect(say("tidy Downloads").reveal).toBe("downloads");
  });

  it("plans a tidy once the standing one is done", () => {
    const t = plan("clean up my downloads", seen({ tasks: [] }));
    const moves = t.steps.find((s) => s.tool === "files.move")!.do;
    if (moves?.kind !== "moves") throw new Error("no moves");
    expect(moves.moves.map((m) => m.id).sort()).toEqual(["d4", "d5", "d6", "d7", "d8"]);
    expect(moves.moves.every((m) => m.to !== ("Deleted" as never))).toBe(true);
  });

  it("refuses to pay, and says so", () => {
    expect(say("pay the power bill").say).toMatch(/never pay/i);
  });

  it("says when a verb isn’t in this build yet", () => {
    expect(say("summarise my week").say).toMatch(/later/);
    expect(say("remind me about the passport").say).toMatch(/later/);
  });

  it("leaves plain searches alone", () => {
    expect(understand("lease", seen())).toBeNull();
    expect(understand("Q4 numbers", seen())).toBeNull();
  });
});

describe("understanding: the Developer module", () => {
  const green = { ...DEV, main: { sha: "c07d3b2", what: "Merge #143", checks: "passing" as const } };

  it("needs the module on", () => {
    expect(say("ship it", seen({ modules: [] })).say).toMatch(/Developer module/);
  });

  it("points to the running fix instead of starting another", () => {
    expect(say("fix main").reveal).toBe("check");
    expect(say("deploy").reveal).toBe("check");
  });

  it("won’t ship a failing main", () => {
    expect(say("ship it", seen({ tasks: [] })).say).toMatch(/failing/);
  });

  it("ships a green main: staging acts and tells, production asks", () => {
    const t = plan("ship it", seen({ tasks: [], dev: green }));
    expect(t.steps.map((s) => s.tool)).toEqual(["deploy.staging", "deploy.production"]);
    expect(t.module).toBe("developer");
  });

  it("says when there’s nothing to ship", () => {
    const shipped = { ...green, deploys: green.deploys.map((d) => ({ ...d, sha: "c07d3b2" })) };
    expect(say("deploy", seen({ tasks: [], dev: shipped })).say).toMatch(/already on main/);
  });
});

describe("understanding: rules, memory and voice", () => {
  const ruled = (text: string) => {
    const h = understand(text, seen());
    if (h?.kind !== "rule") throw new Error(`no rule for “${text}”`);
    return h;
  };

  it.each([
    ["never email anyone after 10 pm", { tool: "mail.send", after: "22:00", before: "07:00", then: "never" }],
    ["don't email Mark", { tool: "mail.send", person: "Mark D’Souza", then: "never" }],
    ["always ask before emailing Dad", { tool: "mail.send", person: "Dad", then: "ask" }],
    ["never deploy to production after 6 pm", { tool: "deploy.production", after: "18:00", then: "never" }],
    ["never merge after 9", { tool: "code.merge", after: "21:00" }],
  ])("turns “%s” into a rule the guard checks", (text, want) => {
    const h = ruled(text);
    expect(h.rule).toMatchObject(want);
    expect(h.rule.note).toBeUndefined();
  });

  it.each(["never email Mark on Sundays", "don't cc Mark on lease emails", "always be nicer to Priya"])("keeps “%s” as a note and says it can’t enforce it", (text) => {
    const h = ruled(text);
    expect(h.rule.note).toBe(true);
    expect(h.read).toMatch(/won’t pretend to enforce/);
  });

  it("schedules mornings because the memory file says so, and stops once the line is gone", () => {
    const withFact = plan("find a time with Priya", seen({ memory: "- Prefers meetings in the morning · from: Calendar · likely" }));
    expect(withFact.sources.some((x) => x.startsWith("Memory"))).toBe(true);
    const holds = (t: ReturnType<typeof plan>) => {
      const d = t.steps.find((s) => s.tool === "calendar.hold")!.do;
      if (d?.kind !== "hold") throw new Error("no holds");
      return d.holds.map((h) => Number(h.time.split(":")[0]));
    };
    expect(holds(withFact).every((h) => h < 12)).toBe(true);
    const without = plan("find a time with Priya", seen({ memory: "" }));
    expect(without.sources.some((x) => x.startsWith("Memory"))).toBe(false);
  });

  it("writes in the voice on the voice page", () => {
    const t = plan("reply to Sam saying sounds good", seen({ voice: { Sam: { hi: "Sam,", bye: "", from: "" } } }));
    const d = t.steps.find((s) => s.tool === "mail.draft")!.do;
    if (d?.kind !== "draft") throw new Error("no draft");
    expect(d.mail.body).toBe("Sam,\n\nSounds good.");
  });
});

describe("understanding: handing skills back", () => {
  it.each(["let me do the weekly report myself", "hand back the weekly report", "I'll do the weekly report myself"])("keeps “%s” as a note in your words", (text) => {
    const h = understand(text, seen());
    if (h?.kind !== "rule") throw new Error("no rule");
    expect(h.rule.note).toBe(true);
    expect(h.rule.text).toBe("Rohan does the weekly report. Ambit helps with what’s needed and doesn’t do it.");
  });
});
