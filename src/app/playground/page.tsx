import type { Metadata } from "next";
import { SiteNav } from "@/brand/SiteNav";
import { getItems } from "@/content/playground";
import { EMAIL } from "@/content/site";
import { CopyButton } from "@/playground/CopyButton";
import { fill } from "@/playground/prompt-text";
import { Accent } from "@/notebook/Title";
import { Preview } from "@/playground/Preview";
import "../home.css";
import "@/notebook/notebook.css";
import "@/playground/builder.css";
import "@/playground/playground.css";

// The Playground: frontend pieces for a landing page (WebGL heroes, shaders, cursor effects),
// each running live, with a prompt to build your own and the pitfalls to skip.

export const metadata: Metadata = {
  title: "Playground · Rohan Pant",
  description: "Frontend pieces for a landing page, running live: WebGL heroes, shaders and cursor effects, each with the prompt to build your own and the mistakes to skip.",
};

const MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent("Hello from the Playground")}`;

export default function PlaygroundPage() {
  const items = getItems();

  return (
    <main className="home nb pg">
      <SiteNav mail={MAIL} />

      <header className="nb-head pg-head">
        <div>
          <p className="hero-status">
            <span className="dot" aria-hidden="true" />
            Playground
          </p>
          <h1>
            Fancy frontend for your landing page, and the <em>prompt</em> to make it.
          </h1>
          <p className="nb-head-sub">Each one runs right here. Copy the prompt into your coding agent, see where the obvious version breaks, take the code if you’d rather start from mine.</p>
        </div>
      </header>

      <ul className="pg-list">
        {items.map((item) => (
          <li key={item.slug} className="pg-card">
            <Preview slug={item.slug} />
            <div className="pg-card-text">
              <p className="nb-meta">
                <span className="nb-type">{item.kind}</span>
                <span>{item.stack.join(" · ")}</span>
                <span>{item.mistakes.length} pitfalls covered</span>
              </p>
              <h2>
                <a href={`/playground/${item.slug}/`}>
                  <Accent text={item.title} />
                </a>
              </h2>
              <p className="pg-card-dek">{item.dek}</p>
              <p className="pg-card-actions">
                <CopyButton text={fill(item.template, Object.fromEntries(item.variables.map((v) => [v.key, v.value])))} className="pg-copy" />
                <a href={`/playground/${item.slug}/`}>
                  Prompt, mistakes and code <span aria-hidden="true">→</span>
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
