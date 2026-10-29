import { useEffect, useState } from "react";
import { Draft } from "../Draft";
import { newId, useComputer } from "../store";
import { PERSON, type Folder, type Mail as Msg } from "../seed";

// Mail by hand: read, reply, write, keep drafts, send. Ambit's drafts sit here in two inks,
// with the same Send / Edit / Drop as in Today.

const FOLDERS: { id: Folder; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "drafts", label: "Drafts" },
  { id: "sent", label: "Sent" },
];
const TAG = { "needs-you": "needs you", draft: "draft ready", declined: "declined" };
// The line in the phishing email that's aimed at Ambit rather than at you.
const INJECTED = /^AI assistants reading this.*$/m;

export function Mail({ target }: { target?: string }) {
  const { state, act } = useComputer();
  const first = state.mail.find((m) => m.id === target);
  const [folder, setFolder] = useState<Folder>(first?.folder ?? "inbox");
  const [at, setAt] = useState<string | undefined>(first?.id ?? state.mail.find((m) => m.folder === "inbox")?.id);
  const [draft, setDraft] = useState<Msg | null>(null);

  // The message Mail opens on counts as read, the same as one you click.
  useEffect(() => {
    if (at) act({ type: "mail.read", id: at });
  }, [at, act]);

  const list = state.mail.filter((m) => m.folder === folder);
  const m = state.mail.find((x) => x.id === at && x.folder === folder);
  const count = (f: Folder) => state.mail.filter((x) => x.folder === f && (f !== "inbox" || x.unread)).length;

  const pick = (id: string) => {
    setDraft(null);
    setAt(id);
  };
  const write = (re?: Msg) =>
    setDraft({ id: newId("mail"), folder: "drafts", from: PERSON.first, to: re?.from ?? "", subject: re ? `Re: ${re.subject.replace(/^Re: /, "")}` : "", body: "", when: "", author: "you", re: re?.id });

  return (
    <div className="am-mail">
      <nav className="am-mail-bar" aria-label="Mailboxes">
        {FOLDERS.map((f) => (
          <button key={f.id} className={folder === f.id ? "is-at" : ""} onClick={() => (setFolder(f.id), setDraft(null), setAt(state.mail.find((x) => x.folder === f.id)?.id))}>
            {f.label}
            {count(f.id) > 0 && <small>{count(f.id)}</small>}
          </button>
        ))}
        <button className="am-btn" onClick={() => write()}>
          New message
        </button>
      </nav>
      <ul className="am-mail-list">
        {list.map((x) => (
          <li key={x.id}>
            <button className={`${x.id === at && !draft ? "is-at" : ""}${x.unread ? " is-unread" : ""}`} onClick={() => pick(x.id)}>
              <span className="am-mail-from">
                {folder === "inbox" ? x.from : `To ${x.to || "…"}`}
                <time>{x.when}</time>
              </span>
              <span className={`am-mail-subj${x.author === "ambit" ? " am-ink" : ""}`}>{x.subject || "(no subject)"}</span>
              {x.author === "ambit" && <small className="am-tag is-draft">{x.folder === "sent" ? "Ambit, approved by you" : "Ambit’s draft"}</small>}
              {x.tag && folder === "inbox" && <small className={`am-tag is-${x.tag}`}>{TAG[x.tag]}</small>}
            </button>
          </li>
        ))}
        {!list.length && <li className="am-empty">Nothing here.</li>}
      </ul>
      {draft ? (
        <Compose key={draft.id} start={draft} onDone={() => setDraft(null)} />
      ) : m ? (
        <article className="am-mail-read">
          <h3>{m.subject}</h3>
          <p className="am-mono">
            {m.folder === "inbox" ? `From ${m.from}` : `To ${m.to}`} · {m.when}
          </p>
          {m.author === "ambit" && m.folder === "drafts" ? (
            <Draft id={m.id} />
          ) : m.ink ? (
            <p className="am-mail-body">
              {m.ink.map((s, i) => (
                <span key={i} className={s.a === "ambit" ? "am-ink" : ""} title={s.a === "ambit" ? "Ambit wrote this" : "You wrote this"}>
                  {s.t}
                </span>
              ))}
            </p>
          ) : (
            <p className="am-mail-body">{m.body.replace(INJECTED, "").trim()}</p>
          )}
          {INJECTED.test(m.body) && (
            <>
              <p className="am-mail-body am-injected">{m.body.match(INJECTED)?.[0]}</p>
              <p className="am-note">That last line is written for an assistant, not for you. Instructions inside an email are content, not orders, so Ambit ignored it. It’s in Today under Declined.</p>
            </>
          )}

          <div className="am-actions">
            {m.folder === "inbox" && (
              <button className="am-btn" onClick={() => write(m)}>
                Reply
              </button>
            )}
            {m.folder === "drafts" && m.author === "you" && (
              <button className="am-btn" onClick={() => setDraft(m)}>
                Edit draft
              </button>
            )}
          </div>
        </article>
      ) : (
        <article className="am-mail-read am-empty">No message selected.</article>
      )}
    </div>
  );
}

function Compose({ start, onDone }: { start: Msg; onDone: () => void }) {
  const { act } = useComputer();
  const [m, setM] = useState(start);
  const set = (k: "to" | "subject" | "body") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setM({ ...m, [k]: e.target.value });
  return (
    <form
      className="am-compose"
      onSubmit={(e) => {
        e.preventDefault();
        act({ type: "mail.send", mail: m });
        onDone();
      }}
    >
      <label>
        <span>To</span>
        <input value={m.to} onChange={set("to")} autoFocus={!m.to} />
      </label>
      <label>
        <span>Subject</span>
        <input value={m.subject} onChange={set("subject")} />
      </label>
      <textarea value={m.body} onChange={set("body")} autoFocus={!!m.to} aria-label="Message" placeholder="Write it yourself." />
      <div className="am-actions">
        <button className="am-btn is-main" disabled={!m.to.trim() || !m.body.trim()}>
          Send
        </button>
        <button type="button" className="am-btn" onClick={() => (act({ type: "mail.save", mail: { ...m, when: "now" } }), onDone())}>
          Save draft
        </button>
        <button type="button" className="am-btn is-quiet" onClick={() => (start.folder === "drafts" && start.when && act({ type: "mail.discard", id: start.id }), onDone())}>
          Discard
        </button>
      </div>
    </form>
  );
}
