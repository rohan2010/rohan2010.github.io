// Zone references in a drawing sheet's margin: numbers across the top, letters down the side.
const COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8];
const ROWS = ["A", "B", "C", "D"];

export function Zones() {
  return (
    <div className="zones" aria-hidden="true">
      <div className="zones-top">
        {COLUMNS.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
      <div className="zones-side">
        {ROWS.map((r) => (
          <span key={r}>{r}</span>
        ))}
      </div>
    </div>
  );
}
