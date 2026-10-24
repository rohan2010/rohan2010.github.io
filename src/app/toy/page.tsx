import { Toy } from "@/toy/Toy";

// Step 1 of research/plan.md: the toy on its own, plain, to see if it's fun.
export default function ToyPage() {
  return (
    <main style={{ padding: 24 }}>
      <Toy />
    </main>
  );
}
