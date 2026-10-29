// Ambit OS icons: 24×24 line drawings in the ink colour, 1.5px strokes.

export type AppIcon = "today" | "mail" | "calendar" | "files" | "notes" | "projects" | "settings" | "search" | "about" | "code" | "checks" | "deploys" | "receipts" | "activity" | "desk" | "web" | "branch";

const PATHS: Record<AppIcon, React.ReactNode> = {
  today: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  mail: (
    <>
      <rect x="3.75" y="5.75" width="16.5" height="12.5" rx="2" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.75" y="5.25" width="16.5" height="15" rx="2" />
      <path d="M3.75 9.75h16.5M8.25 3v4M15.75 3v4" />
      <path d="M8 13.5h2M12 13.5h2M8 17h2" />
    </>
  ),
  files: (
    <>
      <path d="M3.75 7.25c0-1.1.9-2 2-2h3.6l2 2h6.9c1.1 0 2 .9 2 2v8.5c0 1.1-.9 2-2 2H5.75c-1.1 0-2-.9-2-2z" />
      <path d="M3.75 10.25h16.5" />
    </>
  ),
  notes: (
    <>
      <rect x="5.25" y="3.75" width="13.5" height="16.5" rx="2" />
      <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" />
    </>
  ),
  projects: (
    <>
      <rect x="3.75" y="3.75" width="7" height="7" rx="1.5" />
      <rect x="13.25" y="3.75" width="7" height="7" rx="1.5" />
      <rect x="3.75" y="13.25" width="7" height="7" rx="1.5" />
      <path d="M16.75 13.75v6M13.75 16.75h6" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5 5" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 11v5.5M12 7.75v.5" />
    </>
  ),
  code: (
    <>
      <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.25 6l-2.5 12" />
    </>
  ),
  checks: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="m8.5 12.25 2.25 2.25 4.75-4.75" />
    </>
  ),
  deploys: (
    <>
      <path d="M12 3.75v11M7.75 8 12 3.75 16.25 8" />
      <path d="M4.75 14.5v3.75c0 1.1.9 2 2 2h10.5c1.1 0 2-.9 2-2V14.5" />
    </>
  ),
  receipts: (
    <>
      <path d="M6 3.75h12v16.5l-2-1.25-2 1.25-2-1.25-2 1.25-2-1.25-2 1.25z" />
      <path d="M9 8.5h6M9 12h6M9 15.5h3" />
    </>
  ),
  desk: (
    <>
      <rect x="6.75" y="3.75" width="13.5" height="10.5" rx="1.5" />
      <path d="M17.25 17.25v1.5c0 .83-.67 1.5-1.5 1.5H5.25c-.83 0-1.5-.67-1.5-1.5v-7.5c0-.83.67-1.5 1.5-1.5h1.5" />
    </>
  ),
  web: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M3.75 12h16.5M12 3.75c2.4 2.6 3.4 5.3 3.4 8.25s-1 5.65-3.4 8.25c-2.4-2.6-3.4-5.3-3.4-8.25S9.6 6.35 12 3.75z" />
    </>
  ),
  branch: (
    <>
      <circle cx="7" cy="5.5" r="1.75" />
      <circle cx="7" cy="18.5" r="1.75" />
      <circle cx="17" cy="8" r="1.75" />
      <path d="M7 7.25v9.5M17 9.75c0 4-4.5 3.5-8.6 7.4" />
    </>
  ),
  activity: (
    <>
      <path d="M3.75 12h3.5l2.25-5.5 5 11 2.25-5.5h3.5" />
    </>
  ),
};

export function Glyph({ name, size = 24 }: { name: AppIcon; size?: number }) {
  return (
    <svg className="am-glyph" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

export function Mark({ size = 14 }: { size?: number }) {
  // Ambit's mark: a ring with an arc inside it. The ring is your limit; the arc is its reach.
  return (
    <svg className="am-mark" width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.75 9.75a3.5 3.5 0 0 1 6.5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
