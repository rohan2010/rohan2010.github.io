"use client";

import { useState } from "react";
import type { PromptVariable } from "@/content/playground";
import { CopyButton } from "./CopyButton";
import { fill, parts } from "./prompt-text";

// A Playground item's prompt, with its blanks filled in live from the fields beside it.
// What you type replaces the example; Reset brings the example back.
export function PromptBuilder({ template, variables }: { template: string; variables: PromptVariable[] }) {
  const examples = Object.fromEntries(variables.map((v) => [v.key, v.value]));
  const [values, setValues] = useState(examples);
  const text = fill(template, values);
  const changed = variables.some((v) => values[v.key] !== v.value);

  return (
    <div className="pb">
      <div className="pb-prompt">
        <div className="pb-head">
          <span>The prompt</span>
          <span className="pb-count">{text.split(/\s+/).length} words</span>
          <CopyButton text={text} className="nb-copy" label="Copy" />
        </div>
        <p className="pb-text">
          {parts(template).map((part, i) =>
            "key" in part ? (
              <mark key={i} className={values[part.key] !== examples[part.key] ? "is-yours" : undefined}>
                {values[part.key] || `{${part.key}}`}
              </mark>
            ) : (
              part.text
            ),
          )}
        </p>
      </div>

      <form className="pb-form" onSubmit={(e) => e.preventDefault()}>
        <div className="pb-form-head">
          <p className="nb-label">Make it yours</p>
          {changed && (
            <button type="button" className="pb-reset" onClick={() => setValues(examples)}>
              Reset to the example
            </button>
          )}
        </div>
        {variables.map((v) => (
          <label key={v.key} className="pb-field">
            <span className="pb-field-label">
              {v.label}
              {v.hint && <small>{v.hint}</small>}
            </span>
            <textarea
              rows={v.value.length > 60 ? 2 : 1}
              value={values[v.key]}
              onChange={(e) => setValues((all) => ({ ...all, [v.key]: e.target.value }))}
              spellCheck
            />
          </label>
        ))}
      </form>
    </div>
  );
}
