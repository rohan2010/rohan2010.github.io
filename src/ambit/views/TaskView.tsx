import { Posted } from "../Draft";
import { kindOf, type Task } from "../tasks";
import { FilesView } from "./FilesView";
import { GitView } from "./GitView";
import { WebView } from "./WebView";
import { WeekView } from "./WeekView";

// Each kind of task shows the thing it's working on, the way you'd look at it yourself:
// code as a graph, a week as a week, files as folders, a web task as the page, an email as a
// letter (the draft itself, in Draft.tsx, while it waits; a posted letter once it's gone).

export function TaskView({ task: t }: { task: Task }) {
  const kind = kindOf(t);
  // Once its letter has gone, a task shows it posted, whatever else it shows.
  const posted = t.draftId ? <Posted id={t.draftId} /> : null;
  if (kind === "code") return <GitView task={t} />;
  if (kind === "schedule")
    return (
      <>
        <WeekView task={t} />
        {posted}
      </>
    );
  if (kind === "files") return <FilesView task={t} />;
  if (kind === "web") return <WebView task={t} />;
  return posted;
}
