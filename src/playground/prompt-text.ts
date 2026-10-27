// A prompt template is plain text with {blanks}. Split it so the blanks can be shown
// highlighted, and fill it to get the text someone actually pastes.

export type Part = { text: string } | { key: string };

export function parts(template: string): Part[] {
  return template.split(/\{(\w+)\}/).map((piece, i) => (i % 2 ? { key: piece } : { text: piece }));
}

export function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}
