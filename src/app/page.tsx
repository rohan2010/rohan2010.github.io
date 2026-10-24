import { EMAIL, site } from "@/content/site";
import { Desk } from "@/desk/Desk";

// Step 1 of research/home-plan.md: the desk, static, with plain text around it.
export default function Home() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui", color: "#1a1a1a" }}>
      <h1 style={{ margin: 0, fontSize: 32 }}>{site.name}</h1>
      <p style={{ margin: "4px 0 0", color: "#555" }}>Full-stack + AI engineer · Delhi · open to roles</p>
      <p style={{ margin: "16px 0 0", fontSize: 19, maxWidth: 560 }}>
        I build AI that does paperwork so humans don’t have to. I’ve mostly spent the free time on Steam.
      </p>
      <Desk />
      <p style={{ color: "#555", fontSize: 14 }}>
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </p>
    </main>
  );
}
