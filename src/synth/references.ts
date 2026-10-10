import path from "node:path";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** The reference library shipped with the skill (the "training" the strategist reads). */
export const REFERENCE_FILES = [
  "principles.md",
  "anti-slop.md",
  "color.md",
  "typography.md",
  "motion.md",
  "voice.md",
  "modes.md",
  "categories/b2b-saas.md",
  "categories/ai.md",
  "categories/devtools.md",
  "categories/fintech.md",
  "categories/consumer.md",
];

export function referencesDir() {
  let d = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(d, "skills", "watercolor", "references");
    if (existsSync(candidate)) return candidate;
    d = path.dirname(d);
  }
  throw new Error("Could not find skills/watercolor/references next to the watercolor package.");
}

export async function readReference(name: string) {
  return readFile(path.join(referencesDir(), name), "utf8").catch(() => "");
}
