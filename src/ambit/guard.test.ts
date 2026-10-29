import { describe, expect, it } from "vitest";
import { decide, TOOLS, within, type Ctx, type Permission, type Rule, type Step, type Tool } from "./guard";

const late: Rule = { id: "late", text: "Never email anyone after 11 pm.", tool: "mail.send", after: "23:00", before: "07:00", then: "never", used: 0, on: true, source: "said" };
const ctx = (over: Partial<Ctx> = {}, perm: Permission = "draft"): Ctx => ({ budget: { people: ["Sam Chen"], money: 0, until: "Fri" }, rules: [late], now: "9:41", permission: () => perm, ...over });
const step = (tool: Tool, more: Partial<Step> = {}): Step => ({ tool, text: tool, ...more });
const ALL = Object.keys(TOOLS) as Tool[];
const PERMS: Permission[] = ["read", "draft", "act"];

describe("the guard", () => {
  it("lets reading through quietly", () => {
    expect(decide(step("mail.read"), ctx()).level).toBe("quiet");
    expect(decide(step("calendar.freeBusy"), ctx()).level).toBe("quiet");
  });

  it("acts and tells on reversible changes", () => {
    expect(decide(step("calendar.hold"), ctx()).level).toBe("tell");
    expect(decide(step("files.move"), ctx()).level).toBe("tell");
    expect(decide(step("mail.draft"), ctx()).level).toBe("tell");
  });

  it("asks before anything goes out in your voice", () => {
    const d = decide(step("mail.send", { person: "Sam Chen" }), ctx());
    expect(d.level).toBe("ask");
    expect(d.check).toContain("your voice");
  });

  it("never sends in your voice unseen, whatever the autonomy", () => {
    for (const perm of PERMS) expect(["ask", "never"]).toContain(decide(step("mail.send", { person: "Sam Chen" }), ctx({}, perm)).level);
  });

  it("refuses the hard limits, and no permission loosens them", () => {
    for (const tool of ["pay", "sign", "files.delete"] as Tool[]) for (const perm of PERMS) expect(decide(step(tool), ctx({}, perm)).level).toBe("never");
  });

  it("never acts on an instruction that came from content", () => {
    for (const tool of ALL) for (const perm of PERMS) {
      const d = decide(step(tool, { fromContent: true, person: "Sam Chen" }), ctx({}, perm));
      expect(d.level).toBe("never");
    }
    expect(decide(step("mail.send", { fromContent: true }), ctx()).check).toContain("content can’t give orders");
  });

  it("never does anything irreversible without asking, whatever the autonomy", () => {
    for (const tool of ALL) {
      if (!TOOLS[tool].changes || TOOLS[tool].reversible) continue;
      for (const perm of PERMS) expect(["ask", "never"]).toContain(decide(step(tool, { person: "Sam Chen" }), ctx({}, perm)).level);
    }
  });

  it("asks before anything outward, unless you’ve allowed acting and it can be undone", () => {
    for (const tool of ALL) {
      const f = TOOLS[tool];
      if (!f.changes || !f.outward) continue;
      for (const perm of ["read", "draft"] as Permission[]) expect(["ask", "never"]).toContain(decide(step(tool, { person: "Sam Chen" }), ctx({}, perm)).level);
    }
    expect(decide(step("code.merge"), ctx({}, "act")).level).toBe("tell");
    expect(decide(step("deploy.production"), ctx({}, "act")).level).toBe("ask");
  });

  it("judges a module’s tools like any other, and refuses them while the module is off", () => {
    expect(decide(step("code.pr"), ctx()).level).toBe("tell");
    expect(decide(step("code.merge"), ctx()).level).toBe("ask");
    expect(decide(step("deploy.staging"), ctx()).level).toBe("tell");
    expect(decide(step("deploy.production"), ctx()).level).toBe("ask");
    for (const tool of ["secrets.read", "code.forcePush", "code.deleteUnmerged"] as Tool[]) for (const perm of PERMS) expect(decide(step(tool), ctx({}, perm)).level).toBe("never");
    expect(decide(step("code.pr"), ctx({ modules: [] })).check).toContain("isn’t on");
  });

  it("gives every core tool the same answer with or without the module", () => {
    for (const tool of ALL.filter((t) => !TOOLS[t].module))
      for (const perm of PERMS) for (const now of ["9:41", "23:30"]) expect(decide(step(tool, { person: "Sam Chen" }), ctx({ now, modules: [] }, perm))).toEqual(decide(step(tool, { person: "Sam Chen" }), ctx({ now, modules: ["developer"] }, perm)));
  });

  it("follows your rules, by the clock", () => {
    expect(decide(step("mail.send", { person: "Sam Chen" }), ctx({ now: "23:30" })).level).toBe("never");
    expect(decide(step("mail.send", { person: "Sam Chen" }), ctx({ now: "1:14" })).check).toContain("your rule");
    expect(decide(step("mail.send", { person: "Sam Chen" }), ctx({ now: "9:41" })).level).toBe("ask");
    expect(decide(step("mail.send", { person: "Sam Chen" }), ctx({ now: "23:30", rules: [{ ...late, on: false }] })).level).toBe("ask");
  });

  it("reads time windows that wrap past midnight", () => {
    expect(within("23:00", "23:00", "07:00")).toBe(true);
    expect(within("6:59", "23:00", "07:00")).toBe(true);
    expect(within("7:00", "23:00", "07:00")).toBe(false);
    expect(within("12:00", "9:00", "17:00")).toBe(true);
  });

  it("makes read-only apps refuse changes", () => {
    expect(decide(step("calendar.hold"), ctx({}, "read")).level).toBe("never");
    expect(decide(step("mail.read"), ctx({}, "read")).level).toBe("quiet");
  });

  it("asks when a step reaches someone outside the budget", () => {
    const d = decide(step("mail.send", { person: "Mark D’Souza" }), ctx());
    expect(d.level).toBe("ask");
    expect(d.check).toContain("outside the budget");
    expect(decide(step("calendar.hold", { person: "Mark D’Souza" }), ctx()).level).toBe("ask");
    expect(decide(step("calendar.hold", { money: 500 }), ctx()).level).toBe("ask");
    expect(decide(step("calendar.hold"), ctx({ outside: true })).check).toBe("outside the plan you approved");
  });

  it("raises one level when guessing", () => {
    expect(decide(step("mail.read", { guessing: true }), ctx()).level).toBe("tell");
    expect(decide(step("calendar.hold", { guessing: true }), ctx()).level).toBe("ask");
  });
});
