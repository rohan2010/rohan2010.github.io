import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The anatomy kit is vendored unchanged from the skill: its hooks write refs
  // during render on purpose (latest-callback pattern), so relax that rule there.
  {
    files: ["src/components/iso/**"],
    rules: { "react-hooks/refs": "off", "react-hooks/exhaustive-deps": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Playwright MCP scratch output (gitignored).
    ".playwright-mcp/**",
  ]),
]);

export default eslintConfig;
