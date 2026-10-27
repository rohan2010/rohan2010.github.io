"use client";

import { useState } from "react";

// Copies a piece of text and says so for a moment.
export function CopyButton({ text, label = "Copy prompt", className = "pl-copy" }: { text: string; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1600);
  };

  return (
    <button type="button" className={`${className}${state === "done" ? " is-copied" : ""}`} onClick={copy}>
      {state === "done" ? "Copied" : state === "failed" ? "Select and copy" : label}
    </button>
  );
}
