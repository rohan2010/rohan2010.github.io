import { useEffect, useState } from "react";
import { edit, plain, words, type Span } from "./ink";
import { NOW } from "./seed";
import { useComputer } from "./store";
import { Hold } from "./views/Hold";

// A draft Ambit started, as a letter, in two inks: its words in brass, yours in ink. Edit it and
// the words you typed are yours. Sending can't be undone, so it takes a held press, and the guard
// is asked again: approving can never get past a "never".

// Ambit's words type themselves in once per visit, the first time a draft is shown.
const typed = new Set<string>();

export function Draft({ id }: { id: string }) {
  const { state, act } = useComputer();
  const m = state.mail.find((x) => x.id === id && x.folder === "drafts");
  const [text, setText] = useState<string | null>(null);
  if (!m?.ink) return null;
  const n = words(m.ink);

  return (
    <div className="am-letter">
      <header className="am-letter-head">
        <dl>
          <dt>To</dt>
          <dd>{m.to}</dd>
          <dt>Re</dt>
          <dd>{m.subject.replace(/^Re: /, "")}</dd>
        </dl>
        <span className="am-stamp" aria-hidden="true">
          <i />
        </span>
      </header>
      {text === null ? (
        <Typed id={m.id} ink={m.ink} />
      ) : (
        <textarea className="am-draft-edit" value={text} onChange={(e) => setText(e.target.value)} autoFocus aria-label="Edit the draft" />
      )}
      <footer>{n.you ? `Ambit wrote ${n.ambit} words, you wrote ${n.you}.` : "Ambit wrote this. You haven’t edited it."}</footer>
      <div className="am-actions">
        {text === null ? (
          <>
            <Hold label="Hold to send" holding="Sending when full…" note="It can’t be unsent." onDone={() => act({ type: "draft.send", id })} />
            <button className="am-btn" onClick={() => setText(plain(m.ink!))}>
              Edit
            </button>
            <button className="am-btn is-quiet" onClick={() => act({ type: "draft.drop", id })}>
              Drop
            </button>
          </>
        ) : (
          <>
            <button
              className="am-btn is-main"
              onClick={() => {
                if (text !== plain(m.ink!)) act({ type: "draft.edit", id, ink: edit(m.ink!, text) });
                setText(null);
              }}
            >
              Done
            </button>
            <button className="am-btn is-quiet" onClick={() => setText(null)}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** The letter's body, revealed a few characters at a time the first time it's shown. */
function Typed({ id, ink }: { id: string; ink: Span[] }) {
  const total = plain(ink).length;
  const [shown, setShown] = useState(() => (typed.has(id) ? total : 0));
  useEffect(() => {
    let raf = 0;
    // Marked as typed only once it has finished, so an interrupted run types again from the start.
    if (typed.has(id) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      raf = requestAnimationFrame(() => setShown(total));
      return () => cancelAnimationFrame(raf);
    }
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(total, Math.round(((now - t0) / 900) * total));
      setShown(k);
      if (k < total) raf = requestAnimationFrame(tick);
      else typed.add(id);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [id, total]);

  // Each span shows only the characters revealed so far, counting from the start of the letter.
  const starts = ink.map((_, i) => ink.slice(0, i).reduce((n, x) => n + x.t.length, 0));
  return (
    <p className="am-draft-body" aria-label={plain(ink)}>
      {ink.map((s, i) => (
        <span key={i} className={s.a === "ambit" ? "am-ink" : ""} title={s.a === "ambit" ? "Ambit wrote this" : "You wrote this"} aria-hidden="true">
          {s.t.slice(0, Math.max(0, shown - starts[i]))}
        </span>
      ))}
      {shown < total && <span className="am-caret" aria-hidden="true" />}
    </p>
  );
}

/** A letter that went out: read-only, with a postmark where the stamp was. */
export function Posted({ id }: { id: string }) {
  const { state } = useComputer();
  const m = state.mail.find((x) => x.id === id && x.folder === "sent");
  const r = state.receipts.find((x) => x.subject === m?.subject);
  if (!m) return null;
  return (
    <div className="am-letter is-posted">
      <header className="am-letter-head">
        <dl>
          <dt>To</dt>
          <dd>{m.to}</dd>
          <dt>Re</dt>
          <dd>{m.subject.replace(/^Re: /, "")}</dd>
        </dl>
        <span className="am-postmark" aria-label={`Sent ${NOW.time}`}>
          <b>Sent</b>
          <small>{m.when}</small>
        </span>
      </header>
      <p className="am-draft-body">
        {(m.ink ?? [{ t: m.body, a: m.author }]).map((s, i) => (
          <span key={i} className={s.a === "ambit" ? "am-ink" : ""}>
            {s.t}
          </span>
        ))}
      </p>
      <footer>{r ? `${r.by} · ${r.undo}` : "Sent."}</footer>
    </div>
  );
}
