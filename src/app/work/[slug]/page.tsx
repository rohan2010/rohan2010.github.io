import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { workBySlug, workPages } from "@/content/work";
import { WorkTemplate } from "../_components/WorkTemplate";

// /work/<slug>/ (MASTER §3). Owner: 1D. Static: every slug is known at build
// time, and an unknown slug is a build error, not a runtime 404 (G6).
export const dynamicParams = false;

export function generateStaticParams() {
  return workPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = workBySlug(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.oneLine,
    alternates: { canonical: `/work/${page.slug}/` },
    openGraph: { url: `/work/${page.slug}/`, title: page.title, description: page.oneLine },
  };
}

export default async function WorkRoute({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const page = workBySlug(slug);
  if (!page) notFound();
  return <WorkTemplate page={page} />;
}
