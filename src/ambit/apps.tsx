import type { AppId } from "./AmbitOS";
import { Calendar } from "./apps/Calendar";
import { Checks } from "./apps/Checks";
import { Activity } from "./apps/Activity";
import { Code } from "./apps/Code";
import { Desk } from "./apps/Desk";
import { Deploys } from "./apps/Deploys";
import { Files } from "./apps/Files";
import { Mail } from "./apps/Mail";
import { Notes } from "./apps/Notes";
import { Projects, type AmbitProject } from "./apps/Projects";
import { Receipts } from "./apps/Receipts";
import { Settings } from "./apps/Settings";
import { PERSON } from "./seed";

// Every app window's contents: Mail, Calendar, Files, Notes and Projects by hand (step 2),
// Receipts (step 3), the Developer module's Code, Checks and Deploys (step 4), Settings (step 5),
// Activity and Ambit's desktop (step 6).

export type { AmbitProject };



export function Apps({ id, target, projects, onApp, onBig }: { id: AppId; target?: string; projects: AmbitProject[]; onApp: (id: AppId) => void; onBig: () => void }) {
  if (id === "mail") return <Mail target={target} />;
  if (id === "calendar") return <Calendar target={target} />;
  if (id === "files") return <Files target={target} />;
  if (id === "notes") return <Notes />;
  if (id === "receipts") return <Receipts />;
  if (id === "activity") return <Activity target={target} />;
  if (id === "desk") return <Desk />;
  if (id === "code") return <Code />;
  if (id === "checks") return <Checks />;
  if (id === "deploys") return <Deploys />;
  if (id === "settings") return <Settings target={target} />;
  if (id === "projects") return <Projects projects={projects} onBig={onBig} target={target} />;
  if (id === "about")
    return (
      <div className="am-pad am-about">
        <p className="am-about-name">Ambit OS</p>
        <p>An operating system for when the agent in it is more capable than you. Your job moves from doing the work to delegating it, checking it and setting its limits. Ambit is the agent. Your ambit is the scope of authority you give someone.</p>
        <dl>
          <dt>Whose computer</dt>
          <dd>{PERSON.name}, by name only. The week is made up: the mail, calendar, files and tasks are demo data, not Rohan’s real life.</dd>
          <dt>Ambit’s brain</dt>
          <dd>Scripted. No model is running; its words are written in advance.</dd>
          <dt>This build</dt>
          <dd>Step 6 of 8: everything up to handing off through a guard, plus Activity with revert, taking over on Ambit’s desktop, and skills handed back.</dd>
          <dt>Made by</dt>
          <dd>
            Rohan Pant.{" "}
            <button className="am-link" onClick={() => onApp("projects")}>
              His projects →
            </button>
          </dd>
        </dl>
      </div>
    );
  return null;
}
