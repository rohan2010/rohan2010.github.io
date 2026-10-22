import type { ArchiveEntry } from "../schema";

// The archive list on /work/ (MASTER §3). Owner: 1D. Résumé-only or team work,
// no full page. Facts from the résumé and the NoteNinja README.
export const archive: ArchiveEntry[] = [
  { name: "NoteNinja", year: "2023", line: "A diffusion model that turns a song into another genre, trained on GTZAN spectrograms.", credit: "Team project", href: "https://github.com/rohan2010/NoteNinja" },
  { name: "Let’s Dunch: Who to Meet", year: "2021–22", line: "A recommender that learned from implicit feedback; registrations rose 30% after the booking redesign I led." },
  { name: "CONCOR digit reader", year: "2021", line: "An offline handwritten-digit CNN on a phone, with the least-sure 15% sent to a person." },
];
