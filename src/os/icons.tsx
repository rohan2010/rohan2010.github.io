// rohanOS icons: 1-bit, 32×32, drawn on the pixel grid (half-pixel strokes, crisp edges).

export type IconName = "folder" | "doc" | "markdown" | "drawing" | "app" | "alias" | "trash" | "disk" | "about" | "desk";

const STROKE = { fill: "#fff", stroke: "#000", strokeWidth: 1 } as const;

function Doc({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <path d="M6.5 2.5h14l6 6v21h-20z" {...STROKE} />
      <path d="M20.5 2.5v6h6" fill="none" stroke="#000" />
      {children}
    </>
  );
}

const lines = (ys: number[], x0 = 9, x1 = 24) => <path d={ys.map((y) => `M${x0} ${y + 0.5}H${x1}`).join("")} stroke="#000" />;

const ICONS: Record<IconName, React.ReactNode> = {
  folder: (
    <>
      <path d="M2.5 8.5h9l2 2h16v17h-27z" {...STROKE} />
      <path d="M2.5 12.5h27" stroke="#000" />
    </>
  ),
  doc: <Doc>{lines([12, 15, 18, 21, 24])}</Doc>,
  markdown: (
    <Doc>
      <path d="M9.5 21.5v-7l3 3 3-3v7M19.5 14.5v7M17.5 19.5l2 2 2-2" fill="none" stroke="#000" />
    </Doc>
  ),
  drawing: (
    <Doc>
      <path d="M9.5 11.5h5v4h-5zM17.5 19.5h6v4h-6z" fill="#fff" stroke="#000" />
      <path d="M12 15.5v6.5h5" fill="none" stroke="#000" />
      <path d="M15.5 20.5l2 1.5-2 1.5z" fill="#000" />
    </Doc>
  ),
  app: (
    <>
      <path d="M16 2.5 29.5 16 16 29.5 2.5 16z" {...STROKE} />
      <path d="M13.5 10.5v11l8-5.5z" fill="#000" />
    </>
  ),
  alias: (
    <Doc>
      {lines([12, 15])}
      <path d="M3.5 20.5h10v9h-10z" {...STROKE} />
      <path d="M6 27.5l5-5M8 22.5h3v3" fill="none" stroke="#000" />
    </Doc>
  ),
  trash: (
    <>
      <path d="M8.5 9.5h15l-1.5 19h-12z" {...STROKE} />
      <path d="M6.5 6.5h19v3h-19zM13.5 4.5h5v2h-5z" {...STROKE} />
      <path d="M12.5 12.5v13M16.5 12.5v13M20.5 12.5v13" stroke="#000" />
    </>
  ),
  disk: (
    <>
      <path d="M2.5 10.5h27v12h-27z" {...STROKE} />
      <path d="M5.5 18.5h8" stroke="#000" />
      <path d="M24 17h2v2h-2z" fill="#000" />
    </>
  ),
  about: (
    <Doc>
      <path d="M15 12h2v2h-2zM15 16h2v8h-2z" fill="#000" />
    </Doc>
  ),
  // The startup face: a little monitor on a stand, smiling.
  desk: (
    <>
      <path d="M5.5 3.5h21v18h-21z" {...STROKE} />
      <path d="M8.5 6.5h15v12h-15z" fill="#fff" stroke="#000" />
      <path d="M12 10h2v2h-2zM18 10h2v2h-2zM12 14h1v1h1v1h4v-1h1v-1h1v1h-1v1h-1v1h-4v-1h-1v-1h-1z" fill="#000" />
      <path d="M13.5 21.5v4h5v-4M9.5 25.5h13v3h-13z" {...STROKE} />
    </>
  ),
};

export function Icon({ name, size = 32 }: { name: IconName; size?: number }) {
  return (
    <svg className="os-icon" width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}
