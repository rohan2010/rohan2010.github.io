"use client";

import { useState } from "react";
import { CopyButton } from "./CopyButton";

// The item's source files, one tab each, read from the repo at build time.
export function CodeTabs({
  files,
}: {
  files: {
    path: string;
    label: string;
    lang: string;
    note?: string;
    text: string;
  }[];
}) {
  const [open, setOpen] = useState(0);
  const file = files[open];

  return (
    <div className="pg-code">
      <div className="pg-tabs" role="tablist" aria-label="Files">
        {files.map((f, i) => (
          <button key={f.path} type="button" role="tab" id={`tab-${i}`} aria-selected={i === open} aria-controls="pg-code-panel" onClick={() => setOpen(i)}>
            {f.label}
          </button>
        ))}
      </div>
      <div id="pg-code-panel" role="tabpanel" aria-labelledby={`tab-${open}`} className="pg-code-panel">
        <div className="pg-code-head">
          <span>
            {file.path} · {file.text.split("\n").length} lines
          </span>
          <CopyButton text={file.text} className="nb-copy" label="Copy" />
        </div>
        {file.note && <p className="pg-code-note">{file.note}</p>}
        <pre tabIndex={0}>
          <code>{file.text}</code>
        </pre>
      </div>
    </div>
  );
}
