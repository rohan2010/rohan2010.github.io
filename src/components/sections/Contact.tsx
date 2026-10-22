import { EMAIL, RESUME_HREF, RESUME_READY, contact, newTab, resumeLabels } from "@/content/story";

// The row's own arrow (↗ for a new tab, ↓ for a download, → otherwise) is the
// one that slides in on hover, so a label never shows two arrows.
function Row({ href, label, external, download, big }: { href: string; label: string; external?: boolean; download?: boolean; big?: boolean }) {
  const match = label.match(/^(.*?)\s*([↗↓])$/);
  const text = match ? match[1] : label;
  const arrow = match ? match[2] : "→";
  return (
    <li>
      <a
        href={href}
        className={big ? "contact-row contact-email" : "contact-row"}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        download={download || undefined}
      >
        <span className="min-w-0 break-words">
          {text}
          {external ? <span className="sr-only"> {newTab}</span> : null}
        </span>
        <span className="arrow" data-kept={match ? "" : undefined} aria-hidden="true">
          {arrow}
        </span>
      </a>
    </li>
  );
}

// The one inverted band: the page ends on the accent, with the footer inside.
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="band">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5" data-reveal>
          <p className="eyebrow">{contact.eyebrow}</p>
          <h2 id="contact-title" className="h2 mt-4">
            {contact.title}
          </h2>
          <p className="meta mt-6">{contact.location}</p>
        </div>
        <ul className="border-t border-[var(--band-rule)] lg:col-span-7" data-reveal>
          <Row href={`mailto:${EMAIL}`} label={EMAIL} big />
          <Row href={contact.linkedin.href} label={contact.linkedin.label} external />
          <Row href={contact.github.href} label={contact.github.label} external />
          {RESUME_READY ? <Row href={RESUME_HREF} label={resumeLabels.contact} download /> : null}
        </ul>
      </div>
      <footer className="wrap mt-28">
        <div className="border-t border-[var(--band-rule)] pt-6">
          <p className="meta">{contact.education}</p>
          <p className="meta mt-2">{contact.footer}</p>
        </div>
      </footer>
    </section>
  );
}
