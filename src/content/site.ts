import { existsSync } from "node:fs";
import { join } from "node:path";

// Site-wide facts: name, links, metadata. Server-only (reads the file system).
// Facts come only from docs/RP_resume_developer.pdf. No phone number, ever.

// The résumé link appears only once Rohan's phone-free copy is at
// public/rohan-pant-resume.pdf. Never copy the PDF from docs/.
const RESUME_FILE = "rohan-pant-resume.pdf";
export const RESUME_READY = existsSync(join(process.cwd(), "public", RESUME_FILE));
export const RESUME_HREF = `/${RESUME_FILE}`;

export const EMAIL = "rohanpant.work@gmail.com";
export const LINKEDIN = "https://www.linkedin.com/in/rohan-pant/";
export const GITHUB = "https://github.com/rohan2010";

export const site = {
  name: "Rohan Pant",
  role: "Full-stack + AI engineer",
  title: "Rohan Pant · Full-stack + AI engineer",
  description:
    "A short history of helpful machines, from Lovelace’s 1843 note to today, and the AI work by Rohan Pant that rhymes with each era.",
  url: "https://rohan2010.github.io",
  /** Draft hero line (MASTER §7, open item 3). Rohan picks the final wording. */
  line: "Rohan Pant builds AI that does more than it’s told, and the checks that keep it honest.",
};

export const nav = {
  skip: "Skip to content",
  home: "Rohan Pant",
  work: { label: "Work", href: "/work/" },
  contact: { label: "Contact", href: "/#your-year" },
  resume: { label: "Résumé", href: RESUME_HREF },
};
