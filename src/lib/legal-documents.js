import { readFileSync } from "node:fs";
import { join } from "node:path";

export function readLegalDocument(slug) {
  const path = join(process.cwd(), "src", "content", "legal", `${slug}.txt`);
  const text = readFileSync(path, "utf-8");

  const normalizedText = text
    .replace(/\s*●\s*/g, "\n● ")
    .replace(/:\n/g, ":\n\n")
    .replace(/\.\s+(?=Обработка персональных данных|Настоящее согласие действует|Настоящее согласие может быть отозвано)/g, ".\n\n");

  return normalizedText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
