import type { WorkPage, WorkSlug } from "../schema";
import { bloomscroll } from "./bloomscroll";

// All full work pages. Owner: 1D. Add each page here; order does not matter
// (the template sorts by year for next/previous).
export const workPages: WorkPage[] = [bloomscroll];

export const workBySlug = (slug: string): WorkPage | undefined => workPages.find((page) => page.slug === slug);

/** Pages in ruler order (by year, then title), for next / previous. */
export const workInOrder = () => [...workPages].sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));

export type { WorkSlug };
