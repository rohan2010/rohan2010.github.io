import { newTab } from "@/content/story";

export function Chips({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => (
        <li key={item} className="chip">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** A link that opens in a new tab, saying so to screen readers; the ↗ is decorative. */
export function OutLink({ href, label, className, aria }: { href: string; label: string; className?: string; aria?: string }) {
  const match = label.match(/^(.*?)\s*↗$/);
  const text = match ? match[1] : label;
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {aria ? <span className="sr-only">{aria}</span> : null}
      <span aria-hidden={aria ? "true" : undefined}>{text}</span>
      {match ? <span aria-hidden="true"> ↗</span> : null}
      <span className="sr-only"> {newTab}</span>
    </a>
  );
}
