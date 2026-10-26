// A system design drawn from project.json: nodes laid out left to right by
// longest path, edges that point backwards (retries, loops) routed underneath.
// One bit in rohanOS; a page can recolour it with --d-ink, --d-paper, --d-shadow and --d-loop.

type Node = { id: string; label: string; note?: string };

const W = 184;
const H = 46;
const GAP_X = 52;
const GAP_Y = 22;
const PAD = 16;

function layout(nodes: Node[], edges: [string, string][]) {
  // Back edges: found by DFS from the first node; the rest form a DAG.
  const out = new Map(nodes.map((n) => [n.id, [] as string[]]));
  edges.forEach(([a, b]) => out.get(a)?.push(b));
  const state = new Map<string, number>();
  const back = new Set<string>();
  const visit = (id: string) => {
    state.set(id, 1);
    for (const next of out.get(id) ?? []) {
      if (state.get(next) === 1) back.add(`${id}>${next}`);
      else if (!state.get(next)) visit(next);
    }
    state.set(id, 2);
  };
  nodes.forEach((n) => !state.get(n.id) && visit(n.id));
  const forward = edges.filter(([a, b]) => !back.has(`${a}>${b}`));

  // Layer = longest path from a source.
  const layer = new Map(nodes.map((n) => [n.id, 0]));
  for (let pass = 0; pass < nodes.length; pass++) forward.forEach(([a, b]) => layer.set(b, Math.max(layer.get(b)!, layer.get(a)! + 1)));
  const columns: Node[][] = [];
  nodes.forEach((n) => (columns[layer.get(n.id)!] ??= []).push(n));
  // A node whose edge loops back sits at the bottom of its column, so the loop leaves from below it cleanly.
  const loops = new Set([...back].map((key) => key.split(">")[0]));
  columns.forEach((column) => column.sort((a, b) => Number(loops.has(a.id)) - Number(loops.has(b.id))));
  const rows = Math.max(...columns.map((c) => c.length));
  const height = PAD * 2 + rows * H + (rows - 1) * GAP_Y + (back.size ? 40 : 0);
  const width = PAD * 2 + columns.length * W + (columns.length - 1) * GAP_X;

  const pos = new Map<string, { x: number; y: number }>();
  columns.forEach((column, c) => {
    const top = PAD + ((rows - column.length) * (H + GAP_Y)) / 2;
    column.forEach((n, r) => pos.set(n.id, { x: PAD + c * (W + GAP_X), y: top + r * (H + GAP_Y) }));
  });

  return { width, height, pos, forward, back };
}

/** Pixel size of the drawing, so its window can open at the right size. */
export function designSize(nodes: Node[], edges: [string, string][]) {
  const { width, height } = layout(nodes, edges);
  return { width, height };
}

const INK = { fill: "var(--d-ink, #000)" };
const PAPER = { fill: "var(--d-paper, #fff)", stroke: "var(--d-ink, #000)" };
const LINE = { fill: "none", stroke: "var(--d-ink, #000)" };
const LOOP = { fill: "none", stroke: "var(--d-loop, #000)" };

export function Design({ nodes, edges }: { nodes: Node[]; edges: [string, string][] }) {
  const { width, height, pos, forward, back } = layout(nodes, edges);
  const arrow = (x: number, y: number, dir: 1 | -1) => <path d={`M${x} ${y}l${-7 * dir} -4v8z`} style={INK} />;

  return (
    <svg className="os-design" viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={`System design: ${nodes.map((n) => n.label).join(", ")}`}>
      {forward.map(([a, b]) => {
        const p = pos.get(a)!;
        const q = pos.get(b)!;
        const x0 = p.x + W;
        const y0 = p.y + H / 2;
        const x1 = q.x - 2;
        const y1 = q.y + H / 2;
        const mid = (x0 + x1) / 2;
        return (
          <g key={`${a}>${b}`}>
            <path d={`M${x0} ${y0}H${mid}V${y1}H${x1 - 6}`} style={LINE} />
            {arrow(x1, y1, 1)}
          </g>
        );
      })}
      {[...back].map((key, i) => {
        const [a, b] = key.split(">");
        const p = pos.get(a)!;
        const q = pos.get(b)!;
        const below = height - PAD - 8 - i * 6;
        const x0 = p.x + W / 2;
        const x1 = q.x + W / 2;
        return (
          <g key={key}>
            <path d={`M${x0} ${p.y + H + 2}V${below}H${x1}V${q.y + H + 9}`} style={LOOP} strokeDasharray="3 2" />
            <path d={`M${x1} ${q.y + H + 2}l-4 7h8z`} style={{ fill: "var(--d-loop, #000)" }} />
          </g>
        );
      })}
      {nodes.map((n) => {
        const { x, y } = pos.get(n.id)!;
        return (
          <g key={n.id}>
            <rect x={x + 2.5} y={y + 2.5} width={W} height={H} style={{ fill: "var(--d-shadow, #000)" }} />
            <rect x={x + 0.5} y={y + 0.5} width={W} height={H} style={PAPER} />
            <text x={x + 10} y={y + 19} className="os-design-label">
              {n.label}
            </text>
            {n.note && (
              <text x={x + 10} y={y + 35} className="os-design-note">
                {n.note}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
