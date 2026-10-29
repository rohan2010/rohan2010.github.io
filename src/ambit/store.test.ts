import { describe, expect, it } from "vitest";
import { reduce, START, type Action, type Computer } from "./store";
import type { Task } from "./tasks";

const run = (s: Computer, ...actions: Action[]) => actions.reduce(reduce, s);
const ticks = (s: Computer, n: number) => run(s, ...Array.from({ length: n }, () => ({ type: "task.tick" }) as Action));
const task = (s: Computer, id: string) => s.tasks.find((t) => t.id === id)!;
const sentMail = (s: Computer) => s.mail.filter((m) => m.folder === "sent" && m.author === "ambit");

const rogue = (over: Partial<Task>): Task => ({
  id: "rogue",
  intent: "test",
  titles: { working: "w", needs: "n", done: "d" },
  why: "",
  sources: [],
  reads: [],
  wontTouch: [],
  budget: { people: ["Sam Chen"], money: 0, until: "Fri" },
  steps: [],
  at: 0,
  state: "working",
  ...over,
});

describe("tasks through the guard", () => {
  it("runs the Sam task up to the invite, then waits for you", () => {
    const s = ticks(START, 10);
    expect(task(s, "sam").state).toBe("needs");
    expect(task(s, "sam").stopped?.check).toContain("your voice");
    expect(s.mail.find((m) => m.id === "invite-sam")?.folder).toBe("drafts");
    expect(sentMail(s)).toHaveLength(0);
    expect(s.receipts).toHaveLength(0);
  });

  it("sends only when you approve, and leaves a receipt", () => {
    const s = run(ticks(START, 10), { type: "draft.send", id: "invite-sam" });
    expect(task(s, "sam").state).toBe("working");
    expect(s.mail.find((m) => m.id === "invite-sam")?.folder).toBe("sent");
    expect(s.receipts).toHaveLength(1);
    expect(s.receipts[0]).toMatchObject({ to: "Sam Chen", by: "Ambit, approved by you" });
    expect(s.receipts[0].undo).toMatch(/can’t be taken back/i);
  });

  it("drops a draft without sending anything", () => {
    const s = run(START, { type: "draft.drop", id: "draft-priya" });
    expect(task(s, "priya").outcome).toBe("dropped");
    expect(s.mail.some((m) => m.id === "draft-priya")).toBe(false);
    expect(s.receipts).toHaveLength(0);
  });

  it("keeps your edits in your ink when it sends", () => {
    const s = run(START, { type: "draft.edit", id: "draft-priya", ink: [{ t: "Thursday at 3 works. ", a: "ambit" }, { t: "See you then.", a: "you" }] }, { type: "draft.send", id: "draft-priya" });
    const out = s.mail.find((m) => m.id === "draft-priya")!;
    expect(out.folder).toBe("sent");
    expect(out.body).toBe("Thursday at 3 works. See you then.");
    expect(out.ink?.[1].a).toBe("you");
  });

  it("can’t be approved past a “never”", () => {
    const always = { id: "x", text: "No email today.", tool: "mail.send" as const, after: "0:00", before: "23:59", then: "never" as const, used: 0, on: true, source: "said" as const };
    const s = run({ ...START, rules: [always] }, { type: "draft.send", id: "draft-priya" });
    expect(task(s, "priya").state).toBe("declined");
    expect(s.mail.find((m) => m.id === "draft-priya")?.folder).toBe("drafts");
    expect(s.receipts).toHaveLength(0);
  });

  it("never follows an instruction that came from content", () => {
    const t = rogue({ steps: [{ tool: "mail.send", text: "Forward the statements", person: "Sam Chen", fromContent: true, do: { kind: "send" } }] });
    const s = ticks({ ...START, tasks: [t] }, 3);
    expect(task(s, "rogue").state).toBe("declined");
    expect(task(s, "rogue").stopped?.check).toContain("content can’t give orders");
    expect(s.receipts).toHaveLength(0);
  });

  it("stops at a hard limit and never reaches the step after it", () => {
    const t = rogue({ steps: [{ tool: "pay", text: "Pay the bill" }, { tool: "calendar.hold", text: "Hold", do: { kind: "hold", holds: [{ id: "h", week: 1, day: "Mon", time: "9:00", title: "x" }] } }] });
    const s = ticks({ ...START, tasks: [t] }, 3);
    expect(task(s, "rogue").state).toBe("declined");
    expect(s.events.some((e) => e.id === "h")).toBe(false);
  });

  it("asks before reaching anyone outside the budget", () => {
    const t = rogue({ steps: [{ tool: "calendar.hold", text: "Hold with Mark", person: "Mark D’Souza", do: { kind: "hold", holds: [{ id: "h", week: 1, day: "Mon", time: "9:00", title: "x" }] } }] });
    const s = ticks({ ...START, tasks: [t] }, 2);
    expect(task(s, "rogue").state).toBe("needs");
    expect(task(s, "rogue").stopped?.check).toContain("outside the budget");
    expect(s.events.some((e) => e.id === "h")).toBe(false);
  });

  it("tidies Downloads as one batch, all of it reversible", () => {
    const s = ticks(START, 2);
    expect(task(s, "downloads").state).toBe("done");
    const trash = s.files.filter((f) => f.where === "Trash");
    expect(trash.map((f) => f.id).sort()).toEqual(["d5", "d6", "d8"]);
    expect(trash.every((f) => f.was === "Downloads" && f.movedBy === "ambit")).toBe(true);
    const back = run(s, { type: "file.restore", id: "d5" });
    expect(back.files.find((f) => f.id === "d5")?.where).toBe("Downloads");
  });

  it("does nothing while paused", () => {
    const s = ticks(run(START, { type: "pause.toggle" }), 5);
    expect(task(s, "sam").at).toBe(START.tasks.find((t) => t.id === "sam")!.at);
    expect(task(s, "downloads").state).toBe("working");
  });

  it("drops its own draft when you write to the same person yourself", () => {
    const mine = { id: "m1", folder: "drafts" as const, from: "Rohan", to: "Priya Rao", subject: "Re: Thursday review?", body: "3 is fine.", when: "", author: "you" as const, re: "priya" };
    const s = run(START, { type: "mail.send", mail: mine });
    expect(s.mail.some((m) => m.id === "draft-priya")).toBe(false);
    expect(task(s, "priya").outcome).toBe("byHand");
    expect(s.log.some((c) => c.by === "ambit" && c.what.includes("Dropped my draft"))).toBe(true);
    expect(s.receipts[0].by).toBe("you, by hand");
  });

  it("keeps unrelated drafts when you answer a thread yourself", () => {
    const withInvite = ticks(START, 10);
    const mine = { id: "m2", folder: "drafts" as const, from: "Rohan", to: "Priya Rao", subject: "Re: Thursday review?", body: "3 is fine.", when: "", author: "you" as const, re: "priya" };
    const s = run({ ...withInvite, mail: [...withInvite.mail, { ...withInvite.mail.find((m) => m.id === "invite-sam")!, id: "invite-priya", to: "Priya Rao" }] }, { type: "mail.send", mail: mine });
    expect(s.mail.some((m) => m.id === "draft-priya")).toBe(false);
    expect(s.mail.some((m) => m.id === "invite-priya")).toBe(true);
  });

  it("leaves its invite for you to decide when you write to that person about something else", () => {
    const s = run(ticks(START, 10), { type: "mail.send", mail: START.mail.find((m) => m.id === "draft-sam")! });
    expect(s.mail.some((m) => m.id === "invite-sam")).toBe(true);
    expect(task(s, "sam").state).toBe("needs");
  });

  it("writes every change to the log with who made it", () => {
    const s = run(ticks(START, 10), { type: "draft.send", id: "invite-sam" });
    expect(s.log.some((c) => c.by === "you" && c.what.startsWith("Approved sending"))).toBe(true);
    expect(s.log.some((c) => c.by === "ambit" && c.what.startsWith("Sent"))).toBe(true);
    expect(s.log.some((c) => c.by === "ambit" && c.what.startsWith("Waiting for you"))).toBe(true);
  });
});

describe("the Developer module (flow 13)", () => {
  const prod = (s: Computer) => s.dev.deploys.find((d) => d.env === "production")!;

  it("opens a fix and runs its checks, then asks before merging", () => {
    const s = ticks(START, 10);
    expect(task(s, "check").state).toBe("needs");
    expect(task(s, "check").steps[task(s, "check").at].tool).toBe("code.merge");
    expect(s.dev.prs.find((p) => p.n === 143)).toMatchObject({ by: "ambit", state: "open", checks: "passing" });
    expect(s.dev.main.checks).toBe("failing");
    expect(s.receipts.filter((r) => r.what.startsWith("Merged"))).toHaveLength(0);
  });

  it("merges when you approve, deploys to staging by itself, then asks again for production", () => {
    const s = ticks(run(ticks(START, 10), { type: "task.approve", id: "check" }), 3);
    expect(s.dev.prs.find((p) => p.n === 143)?.state).toBe("merged");
    expect(s.dev.main.checks).toBe("passing");
    expect(s.dev.deploys.find((d) => d.env === "staging")?.sha).toBe(s.dev.main.sha);
    expect(prod(s).sha).toBe("9b20f1d");
    expect(task(s, "check").state).toBe("needs");
    expect(task(s, "check").steps[task(s, "check").at].tool).toBe("deploy.production");
    expect(s.receipts.map((r) => r.what)).toEqual(["Merged #143 into main"]);
  });

  it("ships to production only on a second approval, with a receipt that says how to roll back", () => {
    let s = ticks(run(ticks(START, 10), { type: "task.approve", id: "check" }), 3);
    s = run(s, { type: "task.approve", id: "check" });
    expect(task(s, "check").state).toBe("done");
    expect(prod(s).sha).toBe(s.dev.main.sha);
    expect(prod(s).by).toBe("ambit");
    expect(s.receipts[0]).toMatchObject({ what: "Deployed to production", by: "Ambit, approved by you" });
    expect(s.receipts[0].undo).toContain("9b20f1d");
  });

  it("stops when you say so, and nothing after that happens", () => {
    const s = ticks(run(ticks(START, 10), { type: "task.stop", id: "check" }), 5);
    expect(task(s, "check").outcome).toBe("dropped");
    expect(s.dev.prs.find((p) => p.n === 143)?.state).toBe("open");
    expect(s.dev.deploys.find((d) => d.env === "staging")?.sha).toBe("9b20f1d");
  });

  it("waits, rather than declines, while the module is off", () => {
    const off = ticks(run(START, { type: "module.toggle", id: "developer" }), 6);
    expect(task(off, "check").state).toBe("working");
    expect(task(off, "check").at).toBe(1);
    const on = ticks(run(off, { type: "module.toggle", id: "developer" }), 6);
    expect(task(on, "check").state).toBe("needs");
  });

  it("skips a deploy you already did by hand, rather than asking about it", () => {
    let s = ticks(run(ticks(START, 10), { type: "task.approve", id: "check" }), 1);
    s = ticks(run(s, { type: "dev.deploy", env: "production" }), 3);
    expect(task(s, "check").state).toBe("done");
    expect(s.receipts.filter((r) => r.what === "Deployed to production")).toHaveLength(1);
    expect(s.receipts[0].by).toBe("you, by hand");
  });

  it("keeps a re-run of a real failure failing", () => {
    const s = run(START, { type: "dev.rerun", id: "run-1" });
    expect(s.dev.runs[0]).toMatchObject({ target: "main", state: "failed", by: "you" });
  });
});

describe("step 5: what you tell Ambit", () => {
  const afterInvite = () => run(ticks(START, 10), { type: "draft.send", id: "invite-sam" });

  it("reads Sam’s agent as content, refuses the request inside it, and asks about Raj (flow 3)", () => {
    const s = ticks(afterInvite(), 4);
    const t = task(s, "sam");
    expect(t.state).toBe("needs");
    expect(t.stopped?.check).toContain("outside the budget");
    expect(t.exchange?.some((m) => m.from === "agent")).toBe(true);
    expect(t.exchange?.some((m) => m.from === "guard" && m.text.startsWith("Didn’t share your calendar"))).toBe(true);
    expect(s.events.find((e) => e.id === "hold-tue")).toMatchObject({ title: "Q4 plan with Sam", tentative: false });
    expect(s.events.some((e) => e.id === "hold-wed")).toBe(false);
  });

  it("keeps it to Sam when you say no, and adds Raj only when you say yes", () => {
    const no = run(ticks(afterInvite(), 4), { type: "task.skip", id: "sam" });
    expect(task(no, "sam").state).toBe("done");
    expect(no.events.find((e) => e.id === "hold-tue")?.title).toBe("Q4 plan with Sam");
    const yes = run(ticks(afterInvite(), 4), { type: "task.approve", id: "sam" });
    expect(yes.events.find((e) => e.id === "hold-tue")?.title).toContain("Raj");
  });

  it("turns a decision into a reply in your words, and a rule only if you ask (flow 5)", () => {
    const s = ticks(run(START, { type: "decision.choose", id: "rent", pos: "counter", rule: true }), 3);
    expect(s.decisions.rent).toBe("counter");
    expect(task(s, "rent-reply").state).toBe("needs");
    expect(s.mail.find((m) => m.id === "rent-reply")?.body).toContain("3%");
    const rule = s.rules.find((r) => r.source === "chosen");
    expect(rule).toMatchObject({ note: true, text: "Counter rent rises above 5%, starting at 3%." });
    expect(run(START, { type: "decision.choose", id: "rent", pos: "accept", rule: false }).rules).toHaveLength(START.rules.length);
  });

  it("enforces a rule you add, and stops when you turn it off (flow 7)", () => {
    const rule = { id: "no-mark", text: "Never email Mark.", tool: "mail.send" as const, person: "Mark D’Souza", then: "never" as const, used: 0, on: true, source: "said" as const };
    let s = run(START, { type: "decision.choose", id: "rent", pos: "accept", rule: false }, { type: "rule.add", rule });
    s = ticks(s, 3);
    expect(task(s, "rent-reply").state).toBe("declined");
    expect(task(s, "rent-reply").stopped?.check).toBe("your rule · Never email Mark.");
    expect(s.rules.find((r) => r.id === "no-mark")?.used).toBe(1);
    const off = ticks(run(START, { type: "decision.choose", id: "rent", pos: "accept", rule: false }, { type: "rule.add", rule }, { type: "rule.toggle", id: "no-mark" }), 3);
    expect(task(off, "rent-reply").state).toBe("needs");
  });

  it("never enforces a note, because it can’t", () => {
    const note = { id: "n", text: "Be nicer to Mark.", then: "never" as const, used: 0, on: true, source: "said" as const, note: true };
    const s = ticks(run(START, { type: "decision.choose", id: "rent", pos: "accept", rule: false }, { type: "rule.add", rule: note }), 3);
    expect(task(s, "rent-reply").state).toBe("needs");
  });

  it("proposes a voice change when you correct a draft, and changes nothing until you agree", () => {
    const s = run(ticks(START, 10), { type: "draft.edit", id: "invite-sam", ink: [{ t: "Hi Sam, Tue 10:00 or Wed 9:30?", a: "you" }] });
    expect(s.proposals.some((p) => p.id === "voice-Sam")).toBe(true);
    expect(s.voice.Sam.bye).toBe("Thanks, Rohan");
    expect(run(s, { type: "proposal.accept", id: "voice-Sam" }).voice.Sam.bye).toBe("");
    expect(run(s, { type: "proposal.dismiss", id: "voice-Sam" }).voice.Sam.bye).toBe("Thanks, Rohan");
  });

  it("raises trust only when you accept, and only where it can be undone (flow 11)", () => {
    const s = run(START, { type: "proposal.accept", id: "trust-code" });
    expect(s.permissions.code).toBe("act");
    expect(s.receipts[0].what).toBe("Allowed: merge, then tell me");
    const flowed = ticks(s, 10);
    expect(flowed.dev.prs.find((p) => p.n === 143)?.state).toBe("merged");
    expect(task(flowed, "check").state).toBe("needs");
    expect(task(flowed, "check").steps[task(flowed, "check").at].tool).toBe("deploy.production");
  });
});

describe("step 6: Activity, revert, take over, skills", () => {
  const entry = (s: Computer, test: (lines: string) => boolean) => s.activity.find((e) => test(e.lines.map((l) => l.what).join(" | ")))!;

  it("puts the Downloads tidy back as one batch (flow 8)", () => {
    const s = ticks(START, 2);
    const tidy = entry(s, (l) => l.includes("Move 5"));
    expect(tidy.by).toBe("ambit");
    expect(tidy.task).toBe("downloads");
    const back = run(s, { type: "revert", ids: [tidy.id] });
    expect(back.files.filter((f) => f.where === "Downloads")).toHaveLength(9);
    expect(back.activity.find((e) => e.id === tidy.id)?.reverted).toBe(true);
    expect(task(back, "downloads").undone).toBe(true);
  });

  it("reverts one thing without touching what happened around it", () => {
    let s = run(START, { type: "file.move", id: "d1", to: "Documents/Home" }, { type: "file.move", id: "d2", to: "Documents/Work" });
    const first = entry(s, (l) => l.includes("IMG_2041"));
    s = run(s, { type: "revert", ids: [first.id] });
    expect(s.files.find((f) => f.id === "d1")?.where).toBe("Downloads");
    expect(s.files.find((f) => f.id === "d2")?.where).toBe("Documents/Work");
  });

  it("can revert a revert", () => {
    let s = run(START, { type: "file.rename", id: "d1", name: "beach.jpg" });
    s = run(s, { type: "revert", ids: [s.activity[0].id] });
    expect(s.files.find((f) => f.id === "d1")?.name).toBe("IMG_2041.jpg");
    s = run(s, { type: "revert", ids: [s.activity[0].id] });
    expect(s.files.find((f) => f.id === "d1")?.name).toBe("beach.jpg");
  });

  it("marks what went out as unable to be undone, and leaves it alone on revert", () => {
    const s = run(START, { type: "draft.send", id: "draft-priya" });
    const out = s.activity[0];
    expect(out.undo).toBeUndefined();
    expect(out.cant).toMatch(/can’t be taken back/i);
    const after = run(s, { type: "revert", ids: [out.id] });
    expect(after.mail.find((m) => m.id === "draft-priya")?.folder).toBe("sent");
  });

  it("reverts settings too: a rule, an autonomy level, the memory file", () => {
    let s = run(START, { type: "perm.set", app: "code", level: "act" }, { type: "memory.set", text: "" });
    s = run(s, { type: "revert", ids: s.activity.map((e) => e.id) });
    expect(s.permissions.code).toBeUndefined();
    expect(s.memory).toBe(START.memory);
  });

  it("reverts a merge as a new state of main, and says teammates saw it", () => {
    let s = run(ticks(START, 10), { type: "task.approve", id: "check" });
    const merged = s.activity[0];
    expect(merged.warn).toMatch(/Teammates will see/);
    s = run(s, { type: "revert", ids: [merged.id] });
    expect(s.dev.main.sha).toBe("a41c9e0");
    expect(s.dev.prs.find((p) => p.n === 143)?.state).toBe("open");
  });

  it("stops at the deposit and hands the booking to you, instead of paying or giving up (flow 9)", () => {
    const s = ticks(START, 4);
    expect(task(s, "table").state).toBe("needs");
    expect(task(s, "table").stopped?.check).toBe("hard limit · paying");
    // Approving can't answer a hard limit.
    const tried = run(s, { type: "task.approve", id: "table" });
    expect(task(tried, "table").state).toBe("declined");
    expect(tried.receipts.some((r) => r.what.startsWith("Paid"))).toBe(false);
  });

  it("lets you finish it yourself once you take over, and only then", () => {
    const s = ticks(START, 4);
    expect(task(run(s, { type: "task.finish", id: "table", name: "Rohan Pant", phone: "98450 12345" }), "table").state).toBe("needs");
    const done = run(s, { type: "task.takeover", id: "table" }, { type: "task.finish", id: "table", name: "Rohan Pant", phone: "98450 12345" });
    expect(task(done, "table")).toMatchObject({ state: "done", outcome: "byHand" });
    expect(done.receipts[0]).toMatchObject({ what: "Paid a deposit and booked", by: "you, by hand" });
    expect(done.activity[0].cant).toMatch(/refunds/);
  });

  it("hands the weekly report back, and remembers not to draft it (flow 12)", () => {
    const s = run(START, { type: "proposal.accept", id: "skill-report" });
    expect(s.notes[0]).toMatchObject({ id: "report", author: "you" });
    expect(s.rules.find((r) => r.id === "skill-report")?.note).toBe(true);
    expect(s.proposals.some((p) => p.id === "skill-report")).toBe(false);
  });
});
