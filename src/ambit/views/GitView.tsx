import { useComputer } from "../store";
import { stepState, type Task } from "../tasks";

// A code task as a developer would draw it: main, a branch off it in Ambit's brass, the checks
// on the branch, the merge back, then the rail out to staging and production. Each segment draws
// itself in when its step is done; a gate stands where the guard is waiting for you.

export function GitView({ task: t }: { task: Task }) {
  const { state } = useComputer();
  const at = (tool: string) => t.steps.findIndex((s) => s.tool === tool);
  const st = (tool: string) => {
    const n = at(tool);
    return n < 0 ? "none" : stepState(t, n);
  };
  const pr = t.steps.find((s) => s.do?.kind === "pr")?.do;
  const prN = pr?.kind === "pr" ? pr.pr.n : undefined;
  const prDone = st("code.pr") === "done";
  const checks = st("checks.rerun");
  const merged = st("code.merge") === "done";
  const staging = st("deploy.staging");
  const prod = st("deploy.production");
  const waits = t.state === "needs" ? t.steps[t.at].tool : undefined;
  const dropped = t.outcome === "dropped";
  const main = state.dev.main;
  const before = t.steps.some((s) => s.tool === "code.pr") ? "a41c9e0" : main.sha;
  const on = (b: boolean) => (b ? " is-on" : "");

  return (
    <figure className={`am-git${dropped ? " is-dropped" : ""}`} aria-label="The fix, drawn as a git graph">
      <svg viewBox="0 0 400 150" role="img" aria-hidden="true">
        {/* main, faint all the way, inked as far as it's got */}
        <path className="am-git-track" d="M14 40H386" />
        <path className={`am-git-line${on(true)}`} d="M14 40H40" pathLength={1} />
        {prN && (
          <>
            <path className={`am-git-line is-ambit${on(prDone)}`} d="M40 40C64 40 64 100 92 100H118" pathLength={1} />
            <path className={`am-git-line is-ambit${on(checks === "done")}`} d="M118 100H176" pathLength={1} />
            <path className={`am-git-line is-ambit${on(merged)}`} d="M176 100C206 100 206 40 236 40" pathLength={1} />
          </>
        )}
        <path className={`am-git-line${on(merged || !prN)}`} d="M40 40H236" pathLength={1} />
        <path className={`am-git-line is-rail${on(staging === "done")}`} d="M236 40H300" pathLength={1} />
        <path className={`am-git-line is-rail${on(prod === "done")}`} d="M300 40H362" pathLength={1} />

        {/* commits and stations */}
        <g className={`am-git-node${main.checks === "failing" || !merged ? " is-failing" : ""}`} transform="translate(40 40)">
          <circle r="7" />
          {prN && !merged && <path d="M-3 -3l6 6M3 -3l-6 6" />}
        </g>
        <text className="am-git-label" x="40" y="22" textAnchor="middle">
          main · {before}
        </text>

        {prN && (
          <>
            <g className={`am-git-node is-ambit${on(prDone)}${st("code.pr") === "now" ? " is-now" : ""}`} transform="translate(118 100)">
              <circle r="6.5" />
            </g>
            <text className="am-git-label is-ambit" x="118" y="86" textAnchor="middle">
              #{prN} · Ambit
            </text>
            <g className={`am-git-node is-check${on(checks === "done")}${checks === "now" ? " is-now" : ""}`} transform="translate(176 100)">
              <circle r="6.5" />
              {checks === "done" && <path d="M-3 0l2 2.2L3.4 -2.6" />}
            </g>
            <text className="am-git-label" x="176" y="122" textAnchor="middle">
              {checks === "done" ? "checks pass" : checks === "now" ? "checks running" : "checks"}
            </text>
            {waits === "code.merge" && <Gate x={208} y={70} />}
          </>
        )}

        <g className={`am-git-node${on(merged || !prN)}`} transform="translate(236 40)">
          <circle r="7" />
          {(merged || !prN) && <path d="M-3 0l2 2.2L3.4 -2.6" />}
        </g>
        <text className="am-git-label" x="236" y="22" textAnchor="middle">
          {merged ? `main · ${main.sha}` : prN ? "merge" : `main · ${main.sha}`}
        </text>

        <Station x={300} label="staging" state={staging} />
        <Station x={362} label="production" state={prod} />
        {waits === "deploy.production" && <Gate x={331} y={40} />}
      </svg>
      <figcaption className="am-mono">
        {dropped
          ? "Stopped. Nothing after this point happened."
          : waits === "code.merge"
            ? "Waiting at the merge: teammates see it."
            : waits === "deploy.production"
              ? "Waiting before production: customers see it, and it can’t be undone."
              : prod === "done"
                ? "Live in production."
                : "Ambit’s work is brass. Your gates are where it stops."}
      </figcaption>
    </figure>
  );
}

function Station({ x, label, state }: { x: number; label: string; state: string }) {
  return (
    <>
      <rect className={`am-git-station${state === "done" ? " is-on" : ""}${state === "now" ? " is-now" : ""}`} x={x - 7} y={33} width={14} height={14} rx={3} />
      <text className="am-git-label" x={x} y={66} textAnchor="middle">
        {label}
      </text>
    </>
  );
}

/** Where the guard waits for you: a bar across the line with a brass ring. */
function Gate({ x, y }: { x: number; y: number }) {
  return (
    <g className="am-git-gate" transform={`translate(${x} ${y})`}>
      <path d="M0 -13V13" />
      <circle r="4" />
      <text x="0" y="-18" textAnchor="middle">
        you
      </text>
    </g>
  );
}
