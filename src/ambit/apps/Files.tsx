import { useState } from "react";
import { useComputer } from "../store";
import { PLACES, type Place } from "../seed";

// Files by hand: browse, rename, move, put in the Trash and back. Nothing is ever deleted
// for good from here; that's a hard limit for Ambit, and a habit worth keeping for people.

export function Files({ target }: { target?: string }) {
  const { state, act } = useComputer();
  const [place, setPlace] = useState<Place>((PLACES as readonly string[]).includes(target ?? "") ? (target as Place) : "Documents/Home");
  const [at, setAt] = useState<string | null>(null);
  const [naming, setNaming] = useState<string | null>(null);
  const here = state.files.filter((f) => f.where === place);
  const f = here.find((x) => x.id === at);

  const go = (p: Place) => {
    setPlace(p);
    setAt(null);
    setNaming(null);
  };

  return (
    <div className="am-files">
      <nav aria-label="Places">
        {PLACES.map((p) => (
          <button key={p} className={place === p ? "is-at" : ""} onClick={() => go(p)}>
            <span>{p.replace("Documents/", "").replace("/", " ")}</span>
            <small>{state.files.filter((x) => x.where === p).length || ""}</small>
          </button>
        ))}
      </nav>
      <div className="am-files-main">
        <div className="am-files-bar">
          <span className="am-mono">{place}</span>
          {f && (
            <div className="am-actions">
              {place === "Trash" ? (
                <button className="am-btn" onClick={() => (act({ type: "file.restore", id: f.id }), setAt(null))}>
                  Put back
                </button>
              ) : (
                <>
                  <button className="am-btn" onClick={() => setNaming(f.name)}>
                    Rename
                  </button>
                  <select
                    className="am-btn"
                    value=""
                    aria-label="Move to"
                    onChange={(e) => {
                      act({ type: "file.move", id: f.id, to: e.target.value as Place });
                      setAt(null);
                    }}
                  >
                    <option value="" disabled>
                      Move to…
                    </option>
                    {PLACES.filter((p) => p !== place && p !== "Trash").map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <button className="am-btn" onClick={() => (act({ type: "file.move", id: f.id, to: "Trash" }), setAt(null))}>
                    Move to Trash
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <table className="am-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kind</th>
              <th>Size</th>
              <th>{place === "Trash" ? "Was in" : "Changed"}</th>
            </tr>
          </thead>
          <tbody>
            {here.map((x) => (
              <tr key={x.id} className={x.id === at ? "is-at" : ""} onClick={() => (setAt(x.id), naming && x.id !== at && setNaming(null))}>
                <td>
                  {naming !== null && x.id === at ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (naming.trim() && naming !== x.name) act({ type: "file.rename", id: x.id, name: naming.trim() });
                        setNaming(null);
                      }}
                    >
                      <input className="am-rename" value={naming} onChange={(e) => setNaming(e.target.value)} onBlur={(e) => e.currentTarget.form?.requestSubmit()} autoFocus aria-label="New name" />
                    </form>
                  ) : (
                    <button className="am-file-name" onClick={() => setAt(x.id)}>
                      {x.name}
                      {(x.author === "ambit" || x.movedBy === "ambit") && <small className="am-tag is-draft">moved by Ambit</small>}
                    </button>
                  )}
                </td>
                <td>{x.kind}</td>
                <td className="am-mono">{x.size}</td>
                <td>{place === "Trash" ? x.was : x.when}</td>
              </tr>
            ))}
            {!here.length && (
              <tr>
                <td colSpan={4} className="am-empty">
                  Empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
