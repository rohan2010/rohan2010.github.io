import type { Permission } from "./guard";
import { PEOPLE } from "./seed";

// What Ambit knows about its owner, and what it can't decide for them (plans/ambit.md §7, bets 7–11).
// All of it is plain data you can read and change: the memory file is text, your voice is a
// table, a decision is two positions, and trust is a record that only you can act on.

// ── Memory is your file (bet 9) ───────────────────────────────────
export const MEMORY = `# What Ambit knows about Rohan
Demo data for a made-up week, not facts about the real Rohan.
Each line is one fact: what it is · where it came from · how sure. Edit or delete any line.
Ambit reads this file again before every task, so a change counts from the next one.

- Prefers meetings in the morning · from: 9 of your last 12 meetings, and Mail “Q4 plan” · likely
- Works with Priya Rao on the Q4 numbers · from: Mail, Notes · sure
- Prefers short emails · from: 31 sent emails · likely
- Has lunch at home most Sundays · from: Calendar · likely
- Sam Chen is in workshops most afternoons · from: Mail “Q4 plan” · sure
`;

export type Fact = { text: string; from: string; sure: string };
export function facts(file: string): Fact[] {
  return file
    .split("\n")
    .filter((l) => /^\s*-\s+/.test(l))
    .map((l) => {
      const [text, from = "", sure = ""] = l.replace(/^\s*-\s+/, "").split(" · ");
      return { text: text.trim(), from: from.replace(/^from:\s*/, "").trim(), sure: sure.trim() };
    });
}
/** The fact that backs something, if the file still has it. */
export const knows = (file: string, re: RegExp) => facts(file).find((f) => re.test(f.text));

// ── Your voice, visible (bet 11) ──────────────────────────────────
export type Voice = Record<string, { hi: string; bye: string; from: string }>;
export const VOICE: Voice = Object.fromEntries(
  PEOPLE.map((p) => [p.short, { hi: p.hi, bye: p.bye, from: { Sam: "6 sent emails", Priya: "31 sent emails", Mark: "4 sent emails", Dad: "52 sent messages", Meera: "18 sent messages" }[p.short] ?? "" }]),
);

// ── Advisers that argue (bet 7) ───────────────────────────────────
export type Position = { id: string; label: string; pros: { text: string; source?: string }[]; cons: { text: string; source?: string }[]; reply: string; rule: string };
export type Decision = { id: string; question: string; by: string; mail: string; to: string; positions: Position[] };

export const RENT: Decision = {
  id: "rent",
  question: "Mark proposes a 6% rent rise from January.",
  by: "Fri",
  mail: "lease",
  to: "Mark D’Souza",
  positions: [
    {
      id: "accept",
      label: "Accept",
      pros: [{ text: "Similar flats nearby went up about 7% this year", source: "Notes · “Flats nearby”, 3 listings" }, { text: "No risk to the renewal" }],
      cons: [{ text: "₹2,100 more a month, ₹25,200 a year" }],
      reply: "Thanks Mark, ₹37,100 from January is fine. Please send the new agreement.",
      rule: "Accept rent rises at or below the local average.",
    },
    {
      id: "counter",
      label: "Counter at 3%",
      pros: [{ text: "The lease allows a counter within 14 days", source: "Files · Lease_2025.pdf, clause 14" }, { text: "₹1,050 a month less than accepting" }],
      cons: [{ text: "Mark could decline to renew", source: "Mail · “Lease renewal” doesn’t say either way" }, { text: "Takes another round of email" }],
      reply: "Thanks Mark. Could we settle on 3%, ₹36,050 from January? I’ve paid on time for two years and would like to stay.",
      rule: "Counter rent rises above 5%, starting at 3%.",
    },
  ],
};

// ── Earned trust per area (bet 8) ─────────────────────────────────
export type Record_ = { area: string; app: string; did: string; record: string; asks: Permission };
export const TRUST: Record_[] = [
  { area: "Mail · drafts", app: "mail", did: "40 drafted", record: "38 sent unchanged, 2 edited, 0 dropped", asks: "draft" },
  { area: "Calendar · holds", app: "calendar", did: "22 held", record: "20 kept, 2 released by you", asks: "draft" },
  { area: "Files · tidying", app: "files", did: "9 batches", record: "0 put back", asks: "draft" },
  { area: "Code · fixes", app: "code", did: "12 pull requests", record: "12 merged unchanged, 0 reverted", asks: "draft" },
];

export type Proposal = { id: string; kind: "trust" | "voice" | "skill"; module?: string; text: string; why: string; yes: string; no: string };
export const PROPOSALS: Proposal[] = [
  {
    id: "trust-code",
    kind: "trust",
    module: "developer",
    text: "Let me merge my own fixes when their checks pass, and tell you after?",
    why: "I’ve opened 12 pull requests this quarter and you merged all 12 without changes. Production deploys would still ask, and you can take this back in Settings › Autonomy.",
    yes: "Yes, merge and tell me",
    no: "Keep asking",
  },
  {
    // Skills handed back (bet 4): noticing what you've stopped doing, and offering it back.
    id: "skill-report",
    kind: "skill",
    text: "You haven’t written the weekly report yourself since August. Want to write this one?",
    why: "I’ve drafted the last 12. Writing one now and then keeps it yours. I’ll put the week’s numbers in a note and stay out of the writing.",
    yes: "Yes, I’ll write it",
    no: "Not this week",
  },
];
