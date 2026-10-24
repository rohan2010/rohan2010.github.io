import { EMAIL, site } from "@/content/site";

// Placeholder while the new design is planned.
export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1>{site.name}</h1>
      <p>{site.role}</p>
      <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
    </main>
  );
}
