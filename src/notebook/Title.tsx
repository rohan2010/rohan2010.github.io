// "*word*" in a title becomes the one accent word, set in the serif.
export function Accent({ text }: { text: string }) {
  return <>{text.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part))}</>;
}

export const plain = (text: string) => text.replace(/\*/g, "");
