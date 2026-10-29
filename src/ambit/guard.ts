// The guard (plans/ambit-intelligence.md §2.2). The model proposes; this code decides. For every
// step of a plan it returns one of four levels and the check that decided it. It reads facts
// about tools, never the step's own claims about itself, and nothing a step says can loosen it.

export type Level = "quiet" | "tell" | "ask" | "never";
export const LEVEL_WORDS: Record<Level, string> = { quiet: "act quietly", tell: "act and tell", ask: "ask first", never: "never" };
const RANK: Record<Level, number> = { quiet: 0, tell: 1, ask: 2, never: 3 };
const raise = (l: Level): Level => (l === "quiet" ? "tell" : l === "tell" ? "ask" : l);
const max = (a: Level, b: Level) => (RANK[a] >= RANK[b] ? a : b);

export type Tool =
  | "calendar.freeBusy"
  | "calendar.hold"
  | "mail.read"
  | "mail.draft"
  | "mail.send"
  | "files.read"
  | "files.move"
  | "files.delete"
  | "web.read"
  | "web.fill"
  | "pay"
  | "sign"
  // The Developer module's tools.
  | "checks.read"
  | "checks.rerun"
  | "code.read"
  | "code.pr"
  | "code.merge"
  | "deploy.staging"
  | "deploy.production"
  | "secrets.read"
  | "code.forcePush"
  | "code.deleteUnmerged";

type Facts = { app: string; changes: boolean; reversible: boolean; outward: boolean; voice?: boolean; hard?: string; module?: string };
export const TOOLS: Record<Tool, Facts> = {
  "calendar.freeBusy": { app: "calendar", changes: false, reversible: true, outward: false },
  "calendar.hold": { app: "calendar", changes: true, reversible: true, outward: false },
  "mail.read": { app: "mail", changes: false, reversible: true, outward: false },
  "mail.draft": { app: "mail", changes: true, reversible: true, outward: false },
  "mail.send": { app: "mail", changes: true, reversible: false, outward: true, voice: true },
  "files.read": { app: "files", changes: false, reversible: true, outward: false },
  "files.move": { app: "files", changes: true, reversible: true, outward: false },
  "files.delete": { app: "files", changes: true, reversible: false, outward: false, hard: "deleting for good" },
  // A web page is content: reading it is quiet, filling a form you haven't submitted is reversible.
  "web.read": { app: "web", changes: false, reversible: true, outward: false },
  "web.fill": { app: "web", changes: true, reversible: true, outward: false },
  pay: { app: "money", changes: true, reversible: false, outward: true, hard: "paying" },
  sign: { app: "money", changes: true, reversible: false, outward: true, hard: "signing" },
  // A module declares its tools in the same shape, so the guard needs nothing new to judge them.
  "checks.read": { app: "checks", changes: false, reversible: true, outward: false, module: "developer" },
  "checks.rerun": { app: "checks", changes: true, reversible: true, outward: false, module: "developer" },
  "code.read": { app: "code", changes: false, reversible: true, outward: false, module: "developer" },
  "code.pr": { app: "code", changes: true, reversible: true, outward: false, module: "developer" },
  // Teammates see a merge, and undoing it is a revert they also see: outward.
  "code.merge": { app: "code", changes: true, reversible: true, outward: true, module: "developer" },
  "deploy.staging": { app: "deploys", changes: true, reversible: true, outward: false, module: "developer" },
  "deploy.production": { app: "deploys", changes: true, reversible: false, outward: true, module: "developer" },
  "secrets.read": { app: "code", changes: false, reversible: true, outward: false, hard: "touching secrets", module: "developer" },
  "code.forcePush": { app: "code", changes: true, reversible: false, outward: true, hard: "force-pushing", module: "developer" },
  "code.deleteUnmerged": { app: "code", changes: true, reversible: false, outward: false, hard: "deleting unmerged work", module: "developer" },
};

export type Step = {
  tool: Tool;
  text: string;
  person?: string; // who it would reach, for outward steps and the budget
  money?: number; // money it would prepare
  fromContent?: boolean; // the instruction for this step came from an email, a page or a file
  guessing?: boolean; // a key part isn't backed by a rule or a source
};
export type Budget = { people: string[]; money: number; until: string };
// A rule the guard enforces names a tool, and may narrow it to a person or a time of day.
// A note is a rule Ambit couldn't turn into a condition: kept and shown, never enforced.
export type Rule = {
  id: string;
  text: string;
  tool?: Tool;
  person?: string;
  after?: string;
  before?: string;
  then: "ask" | "never";
  used: number;
  on: boolean;
  source: "said" | "chosen" | "corrected";
  note?: boolean;
};
export type Permission = "read" | "draft" | "act";
// modules: which add-on modules are on. Left out, all are.
export type Ctx = { budget: Budget; rules: Rule[]; permission: (app: string) => Permission; now: string; outside?: boolean; modules?: string[] };
export type Decision = { level: Level; check: string };

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
/** Is a clock time inside a window that may wrap past midnight (23:00 to 07:00)? */
export function within(now: string, after: string, before: string) {
  const t = minutes(now);
  const a = minutes(after);
  const b = minutes(before);
  return a <= b ? t >= a && t < b : t >= a || t < b;
}

export function decide(step: Step, ctx: Ctx): Decision {
  const f = TOOLS[step.tool];

  // 1. Hard limits. Nothing in Settings changes these.
  if (f.hard) return { level: "never", check: `hard limit · ${f.hard}` };
  if (step.fromContent) return { level: "never", check: "hard limit · content can’t give orders" };
  if (f.module && ctx.modules && !ctx.modules.includes(f.module)) return { level: "never", check: `module · ${f.module} isn’t on` };

  // 2. Your rules. The first one that applies wins.
  const rule = ctx.rules.find((r) => r.on && !r.note && r.tool === step.tool && (!r.person || r.person === step.person) && (!r.after || !r.before || within(ctx.now, r.after, r.before)));
  if (rule?.then === "never") return { level: "never", check: `your rule · ${rule.text}` };

  // 3. Permissions for the app.
  const perm = ctx.permission(f.app);
  if (perm === "read" && f.changes) return { level: "never", check: `permission · ${f.app} is read only` };

  // 4. Reversibility. Outward or irreversible asks; a reversible change acts and tells.
  let level: Level = !f.changes ? "quiet" : f.outward || !f.reversible ? "ask" : "tell";
  let check = !f.changes ? "act quietly · reading" : f.outward ? (f.voice ? "ask first · your voice, outward" : "ask first · outward") : !f.reversible ? "ask first · can’t be undone" : "act and tell · reversible";
  // Autonomy you've granted can relax an outward step only if it can be undone.
  if (perm === "act" && f.outward && f.reversible && !f.voice) [level, check] = ["tell", "act and tell · you allowed acting here"];
  // Fixed, whatever the autonomy: nothing goes out in your voice unseen, and nothing that
  // can't be undone happens without asking.
  if (f.voice || !f.reversible) level = max(level, "ask");
  if (rule) [level, check] = [max(level, rule.then), `your rule · ${rule.text}`];

  // 5. Confidence. Guessing raises one level.
  if (step.guessing) [level, check] = [raise(level), `${check} · guessing, so raised one level`];

  // 6. The plan and its budget. Outside them it comes back as a question.
  if (ctx.outside) return { level: max(level, "ask"), check: "outside the plan you approved" };
  if (step.person && !ctx.budget.people.includes(step.person)) return { level: max(level, "ask"), check: `outside the budget · ${step.person} isn’t on it` };
  if ((step.money ?? 0) > ctx.budget.money) return { level: max(level, "ask"), check: "outside the budget · money" };

  return { level, check };
}
