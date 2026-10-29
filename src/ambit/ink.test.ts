import { describe, expect, it } from "vitest";
import { by, edit, plain, words } from "./ink";

describe("two inks", () => {
  const start = by("Thursday at 3 works. I’ll bring the revised numbers.", "ambit");

  it("keeps Ambit’s words and makes typed words yours", () => {
    const after = edit(start, "Thursday at 3 works. I’ll bring the final numbers, and coffee.");
    expect(plain(after)).toBe("Thursday at 3 works. I’ll bring the final numbers, and coffee.");
    const you = after.filter((s) => s.a === "you").map((s) => s.t).join("");
    expect(you).toContain("final");
    expect(you).toContain("coffee.");
    expect(you).not.toContain("Thursday");
    expect(after[0]).toEqual({ t: "Thursday at 3 works. I’ll bring the ", a: "ambit" });
  });

  it("changes nothing when nothing changed", () => {
    expect(edit(start, plain(start))).toEqual(start);
  });

  it("gives every word to you when you rewrite it all", () => {
    const after = edit(start, "Can we do Friday instead?");
    expect(after.every((s) => s.a === "you")).toBe(true);
  });

  it("counts words per author", () => {
    const after = edit(start, "Thursday at 3 works. See you then.");
    const n = words(after);
    expect(n.ambit).toBe(4);
    expect(n.you).toBe(3);
  });
});
