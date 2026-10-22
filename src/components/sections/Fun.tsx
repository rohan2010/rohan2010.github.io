import { NOTCHES } from "@/components/figures/bench/model";
import { notebook, projects } from "@/content/projects";
import { fun, chapters } from "@/content/story";
import { Chips, OutLink } from "../ui/Chips";
import { Chapter } from "../ui/Chapter";

// A model name as a small cartridge, with a key-notch pattern like the bench's.
function CartridgeTag({ name, index }: { name: string; index: number }) {
  const pattern = NOTCHES[index % NOTCHES.length]!;
  return (
    <li className="cart-tag">
      <span className="cart-notches" aria-hidden="true">
        {pattern.map((on, notch) => (
          <i key={notch} data-on={on ? "" : undefined} />
        ))}
      </span>
      {name}
    </li>
  );
}

function Notebook() {
  return (
    <div className="mt-20" data-reveal>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="eyebrow">{fun.notebookTitle}</h3>
        <p className="muted text-[15px]">{fun.notebookLead}</p>
      </div>
      <ol className="mt-5 grid gap-6 md:grid-cols-2">
        {notebook.map((entry) => (
          <li key={entry.title} className={`notebook-page card min-w-0 p-6 sm:p-8 ${notebook.length === 1 ? "md:col-span-2" : ""}`}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="meta uppercase">{entry.date}</p>
              <h4 className="h3">{entry.title}</h4>
              <span className="chip chip-accent whitespace-normal">{entry.status}</span>
            </div>
            <p className="small text-ink-3 mt-2">{entry.note}</p>
            <dl className="notebook-fields mt-6 grid gap-5">
              <div>
                <dt className="eyebrow">{fun.notebookFields.question}</dt>
                <dd className="prose-measure mt-1.5 text-[18px] leading-7">{entry.question}</dd>
              </div>
              <div>
                <dt className="eyebrow">{fun.notebookFields.models}</dt>
                <dd className="mt-2.5">
                  <ul className="flex flex-wrap gap-2.5">
                    {entry.models.map((model, index) => (
                      <CartridgeTag key={model} name={model} index={index} />
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="eyebrow">{fun.notebookFields.noticed}</dt>
                <dd className="prose-measure mt-1.5">{entry.noticed}</dd>
              </div>
            </dl>
            {entry.link ? <OutLink href={entry.link.href} label={entry.link.label} className="link mt-6 inline-block py-2" /> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Shelf() {
  return (
    <div className="mt-20">
      <div className="flex flex-wrap items-baseline justify-between gap-3" data-reveal>
        <h3 className="eyebrow">{fun.shelfTitle}</h3>
        <p className="small text-ink-2">{fun.shelfLead}</p>
      </div>
      <ul className="shelf mt-5">
        {projects.map((project) => (
          <li key={project.repo} className="shelf-row" data-reveal>
            <div className="shelf-name">
              <h4 className="h3">{project.name}</h4>
              {project.status ? <span className={`chip mt-3 whitespace-normal ${project.status.includes("research") ? "chip-accent" : ""}`}>{project.status}</span> : null}
            </div>
            <div className="shelf-text">
              <p className="font-medium text-ink">{project.hook}</p>
              <p className="small text-ink-2 mt-3">{project.body}</p>
              {project.note ? <p className="small text-ink-3 mt-3">{project.note}</p> : null}
            </div>
            <div className="shelf-meta">
              <Chips items={project.chips} className="shelf-chips" />
              <div className="mt-4 flex gap-5 text-[15px] lg:mt-auto lg:pt-4">
                <OutLink href={project.code} label={fun.codeLabel} aria={`${project.name}: code on GitHub`} className="link py-2" />
                {project.live ? <OutLink href={project.live} label={fun.liveLabel} aria={`${project.name}: live site`} className="link py-2" /> : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8" data-reveal>
        <OutLink href={fun.more.href} label={fun.more.label} className="link py-2 text-[17px]" />
      </p>
    </div>
  );
}

// 04 For fun (now): the workbench. DecentralMem.AI with its stack laid out
// like the cabinet's drawers, then the lab notebook and the shelf.
export function Fun({ figure }: { figure: React.ReactNode }) {
  const { memory } = fun;
  return (
    <section id="fun" aria-labelledby="fun-title" className="section">
      <div className="wrap">
        <Chapter chapter={chapters[3]!} title={fun.title} lead={fun.lead} figure={figure} side="right" />
        <article className="card memory-card" data-reveal>
          <div className="memory-text">
            <h3 className="h3">{memory.name}</h3>
            <p className="small text-ink-2 mt-1">{memory.kind}</p>
            <p className="mt-5 max-w-[60ch]">{memory.body}</p>
            {memory.code ? <OutLink href={memory.code.href} label={memory.code.label} className="link mt-6 inline-block py-2" /> : null}
          </div>
          <div className="memory-stack">
            <h4 className="meta">{memory.stackLabel}</h4>
            <ul className="mt-3">
              {memory.stack.map((part) => (
                <li key={part.name}>
                  <span className="mono text-[14px] text-ink">{part.name}</span>
                  <span className="small text-ink-2">{part.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
        <Notebook />
        <Shelf />
      </div>
    </section>
  );
}
