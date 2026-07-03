import { readFileSync } from "node:fs";
import { join } from "node:path";

export function readLegalDocument(slug) {
  const path = join(process.cwd(), "src", "content", "legal", `${slug}.txt`);
  const text = readFileSync(path, "utf-8");

  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
