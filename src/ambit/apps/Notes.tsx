import { useState } from "react";
import { newId, useComputer } from "../store";
import type { Note } from "../seed";

// Notes by hand. A note Ambit wrote is in its ink until you edit it; then it's yours. Word by
// word ink is step 3; here the whole note changes hands.

export function Notes() {
  const { state, act } = useComputer();
  const [at, setAt] = useState<string | undefined>(state.notes[0]?.id);
  const n = state.notes.find((x) => x.id === at);

  return (
    <div className="am-notes">
      <nav aria-label="Notes">
        <button
          className="am-btn"
          onClick={() => {
            const note: Note = { id: newId("note"), title: "New note", body: "", when: "now", author: "you" };
            act({ type: "note.save", note });
            setAt(note.id);
          }}
        >
          New note
        </button>
        <ul>
          {state.notes.map((x) => (
            <li key={x.id}>
              <button className={x.id === at ? "is-at" : ""} onClick={() => setAt(x.id)}>
                <strong className={x.author === "ambit" ? "am-ink" : ""}>{x.title || "Untitled"}</strong>
                <small>
                  {x.when}
                  {x.author === "ambit" && " · Ambit"}
                </small>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {n ? <Editor key={n.id} note={n} onDelete={() => (act({ type: "note.remove", id: n.id }), setAt(state.notes.find((x) => x.id !== n.id)?.id))} /> : <p className="am-empty am-pad">No notes.</p>}
    </div>
  );
}

function Editor({ note, onDelete }: { note: Note; onDelete: () => void }) {
  const { act } = useComputer();
  const [draft, setDraft] = useState(note);
  const changed = draft.title !== note.title || draft.body !== note.body;
  // Saved when you leave a field, so the log reads as edits, not keystrokes.
  const save = () => changed && act({ type: "note.save", note: { ...draft, author: "you", when: "now" } });
  const ambit = note.author === "ambit" && !changed;

  return (
    <div className="am-note-edit">
      <input className={ambit ? "am-ink" : ""} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} onBlur={save} aria-label="Title" />
      <textarea className={ambit ? "am-ink" : ""} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} onBlur={save} aria-label="Note" />
      <footer>
        <span className="am-mono">{note.author === "ambit" ? (changed ? "Yours once you leave the field." : "Ambit wrote this. Edit it and it’s yours.") : `Yours · ${note.when}`}</span>
        <button className="am-btn is-quiet" onClick={onDelete}>
          Delete
        </button>
      </footer>
    </div>
  );
}
