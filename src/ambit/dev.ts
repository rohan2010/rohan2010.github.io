import type { Author } from "./seed";
import type { Task } from "./tasks";

// The Developer module (plans/ambit.md §2): the owner's work as a developer, added to the same week.
// A module brings its apps (Code, Checks, Deploys), its tools (declared in guard.ts with
// module: "developer"), its seed data, and its tasks. Rules, memory and the guard stay shared.

export type Diff = { file: string; minus: string[]; plus: string[] };
export type PR = { n: number; title: string; branch: string; into: string; by: Author; state: "open" | "merged"; checks: "passing" | "failing" | "running" | "none"; body: string; diff: Diff[]; when: string };
export type Run = { id: string; target: string; name: string; state: "passed" | "failed"; when: string; by: Author; log: string };
export type Deploy = { env: "staging" | "production"; sha: string; what: string; when: string; by: Author };
export type Dev = { main: { sha: string; what: string; checks: "passing" | "failing" }; prs: PR[]; runs: Run[]; deploys: Deploy[]; history: Deploy[] };

export const DEV: Dev = {
  main: { sha: "a41c9e0", what: "Merge #142: Invoice export", checks: "failing" },
  prs: [
    {
      n: 142,
      title: "Invoice export",
      branch: "invoice-export",
      into: "main",
      by: "you",
      state: "merged",
      checks: "passing",
      body: "Exports invoices as CSV, with dates in the customer’s format.",
      diff: [{ file: "src/export.ts", minus: [], plus: ["export function toCsv(invoices: Invoice[]) {", "  return invoices.map(row).join(\"\\n\");", "}"] }],
      when: "Wed 18:20",
    },
    {
      n: 139,
      title: "Retry webhooks with backoff",
      branch: "webhook-retry",
      into: "main",
      by: "you",
      state: "open",
      checks: "passing",
      body: "Retries failed webhooks at 1, 4 and 16 minutes, then gives up and logs it.",
      diff: [{ file: "src/webhooks.ts", minus: ["  await send(hook);"], plus: ["  await retry(() => send(hook), [1, 4, 16]);"] }],
      when: "Tue",
    },
  ],
  runs: [
    {
      id: "run-1",
      target: "main",
      name: "nightly",
      state: "failed",
      when: "2:10",
      by: "app",
      log: "FAIL  src/dates.test.ts › formats the invoice date\n  Expected: \"5 Nov 2026\"\n  Received: \"4 Nov 2026\"\n\n  The test builds the date at midnight UTC.\n  The runner is in Asia/Kolkata, so it formats the day before.\n\n1 failed, 212 passed",
    },
    { id: "run-2", target: "main", name: "api (re-run)", state: "passed", when: "2:41", by: "ambit", log: "api.test.ts: 48 passed. The first run timed out on the sandbox; this one didn’t." },
    { id: "run-3", target: "#139", name: "pull request", state: "passed", when: "Tue", by: "app", log: "213 passed" },
  ],
  deploys: [
    { env: "staging", sha: "9b20f1d", what: "Merge #138: Faster search", when: "Tue 16:05", by: "you" },
    { env: "production", sha: "9b20f1d", what: "Merge #138: Faster search", when: "Tue 17:30", by: "you" },
  ],
  history: [],
};

export const FIX: PR = {
  n: 143,
  title: "Fix date test: build the date in local time",
  branch: "fix/143-timezone",
  into: "main",
  by: "ambit",
  state: "open",
  checks: "none",
  body: "The nightly check failed on main: dates.test.ts builds 5 Nov at midnight UTC, and the runner is in Asia/Kolkata, so it formats 4 Nov. This builds the date with the offset. One test file, no app code.",
  diff: [{ file: "src/dates.test.ts", minus: ['  const day = new Date("2026-11-05");'], plus: ['  const day = new Date("2026-11-05T00:00:00+05:30");'] }],
  when: "",
};

export const CHECK_TASK: Task = {
  id: "check",
  module: "developer",
  intent: "keep main green",
  titles: {
    working: "Fixing the failing check on main.",
    needs: "Fix for the failing check, ready to merge.",
    done: "The fix is live. You approved the merge and the deploy.",
    dropped: "You stopped the fix. Nothing merged or deployed after that.",
  },
  why: "A check failed on main at 2:10 a.m. Opening a fix is reversible, so I started. Merging and deploying are yours.",
  sources: ["Checks · nightly on main, failed 2:10", "Code · src/dates.test.ts"],
  reads: ["the check log", "the test file"],
  wontTouch: ["app code", "secrets", "force-pushing", "anyone’s branch but its own"],
  budget: { people: [], money: 0, until: "Thu 5 Nov" },
  steps: [
    { tool: "checks.read", text: "Read the check log: a test assumes UTC" },
    { tool: "code.pr", text: "Open PR #143 with a one-line fix to the test", do: { kind: "pr", pr: FIX } },
    { tool: "checks.rerun", text: "Run the checks on #143", do: { kind: "run", pr: 143 } },
    { tool: "code.merge", text: "Merge #143 into main", cta: "Merge #143", waiting: "Fix for the failing check, ready to merge.", do: { kind: "merge", pr: 143 } },
    { tool: "deploy.staging", text: "Deploy main to staging", do: { kind: "deploy", env: "staging" } },
    { tool: "deploy.production", text: "Deploy main to production", cta: "Deploy to production", waiting: "The fix is on staging. Ready for production?", do: { kind: "deploy", env: "production" } },
  ],
  at: 1,
  state: "working",
};
