"use client";

import { useRef, type ReactNode } from "react";
import { useDecode, type DecodeOptions } from "./useDecode";

// A heading that decodes itself. Screen readers get the real sentence from the first frame; the
// letters you see are aria-hidden. Each letter stays in the line, in its real font, and only goes
// transparent while a mono glyph is drawn over it, so its width is reserved and the line never
// reflows. Words don't break inside, because each one is a nowrap span.

// `parts` is the headline in pieces; mark one piece `accent` to land it last, in the serif.
export type Part = { text: string; accent?: boolean };

type Props = DecodeOptions & {
  parts: Part[];
  as?: "h1" | "h2" | "p";
  className?: string;
  // Gets the replay function, for a Replay button outside the heading.
  children?: (replay: () => void) => ReactNode;
};

export function DecodeText({ parts, as: Tag = "h1", className, children, ...options }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const replay = useDecode(ref, options);

  // Plain letters are numbered in reading order, the accent's after them, so the hook knows
  // when each one settles.
  const chars = parts.flatMap((p) => Array.from(p.text, (c) => ({ c, accent: !!p.accent })));
  const plain = chars.filter((ch) => !ch.accent && ch.c !== " ").length;
  let k = 0;
  let a = plain;
  const words: { c: string; accent: boolean; k: number }[][] = [[]];
  for (const ch of chars) {
    if (ch.c === " ") words.push([]);
    else words[words.length - 1].push({ ...ch, k: ch.accent ? a++ : k++ });
  }
  const text = parts.map((p) => p.text).join("");

  return (
    <>
      <Tag ref={ref} className={`dh-text${className ? ` ${className}` : ""}`}>
        <span className="dh-sr">{text}</span>
        <span aria-hidden="true">
          {words.map((w, i) => (
            <span key={i}>
              <span className="dh-w">
                {w.map((ch) => (
                  <span key={ch.k} className={`dh-c${ch.accent ? " dh-a" : ""}`} data-k={ch.k} data-accent={ch.accent || undefined}>
                    <span className="dh-g" />
                    {ch.c}
                  </span>
                ))}
              </span>
              {i < words.length - 1 && " "}
            </span>
          ))}
        </span>
      </Tag>
      {children?.(replay)}
    </>
  );
}
