import { useComputer } from "../store";
import type { Task } from "../tasks";

// A tidy as where things are: Downloads and each place a file is going, as columns. A file
// moves column when its step runs (and slides in as it arrives), and slides back on undo.

export function FilesView({ task: t }: { task: Task }) {
  const { state } = useComputer();
  const move = t.steps.find((s) => s.do?.kind === "moves")?.do;
  const moves = move?.kind === "moves" ? move.moves : [];
  const ids = new Set(moves.map((m) => m.id));
  const places = ["Downloads", ...new Set(moves.map((m) => m.to))];
  const files = state.files.filter((f) => ids.has(f.id) || f.where === "Downloads");

  return (
    <figure className="am-tidy" aria-label="Where the files are">
      <div className="am-tidy-cols" style={{ gridTemplateColumns: `repeat(${places.length}, minmax(0, 1fr))` }}>
        {places.map((p) => (
          <div key={p} className="am-tidy-col">
            <span className="am-tidy-name">{p.replace("Documents/", "")}</span>
            {files
              .filter((f) => f.where === p)
              .map((f) => (
                <span key={`${f.id}-${f.where}`} className={`am-tidy-file${ids.has(f.id) ? " is-moving" : ""}${f.movedBy === "ambit" ? " is-ambit" : ""}`} title={f.name}>
                  {f.name}
                </span>
              ))}
          </div>
        ))}
      </div>
      <figcaption className="am-mono">{t.undone ? "Put back, every one." : t.state === "done" ? "Moved as one batch. Undo puts them all back." : "Photos stay where they are."}</figcaption>
    </figure>
  );
}
