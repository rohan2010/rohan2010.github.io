import type { Author } from "./seed";

// Two inks (plans/ambit.md §7): a draft is a run of spans, each with who wrote it. When you
// edit a draft, words you kept keep their author and words you typed become yours.

export type Span = { t: string; a: Author };

export const plain = (spans: Span[]) => spans.map((s) => s.t).join("");
export const by = (text: string, a: Author): Span[] => [{ t: text, a }];

/** How many words each author wrote. */
export function words(spans: Span[]) {
  const n = { you: 0, ambit: 0, them: 0, app: 0 };
  spans.forEach((s) => (n[s.a] += s.t.split(/\s+/).filter(Boolean).length));
  return n;
}

/** The spans for an edited text: a word-level diff against the spans before. */
export function edit(before: Span[], text: string): Span[] {
  const old = before.flatMap((s) => tokens(s.t).map((t) => ({ t, a: s.a })));
  const now = tokens(text);
  // Longest common subsequence over tokens; whatever isn't in it was typed by you.
  const L = Array.from({ length: old.length + 1 }, () => new Array<number>(now.length + 1).fill(0));
  for (let i = old.length - 1; i >= 0; i--) for (let j = now.length - 1; j >= 0; j--) L[i][j] = old[i].t === now[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out: Span[] = [];
  let i = 0;
  let j = 0;
  while (j < now.length) {
    if (i < old.length && old[i].t === now[j]) {
      out.push(old[i]);
      i++;
      j++;
    } else if (i < old.length && L[i + 1][j] >= L[i][j + 1]) i++;
    else out.push({ t: now[j++], a: "you" });
  }
  return merge(out);
}

// Words and the space after them; a change of whitespace alone doesn't change hands.
function tokens(text: string) {
  return text.match(/\S+\s*|\s+/g) ?? [];
}

function merge(spans: Span[]) {
  return spans.reduce<Span[]>((acc, s) => {
    const last = acc[acc.length - 1];
    if (last && last.a === s.a) last.t += s.t;
    else acc.push({ ...s });
    return acc;
  }, []);
}
