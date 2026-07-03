import { readFileSync } from "node:fs";
import { join } from "node:path";

export function readLegalDocument(slug) {
  const path = join(process.cwd(), "src", "content", "legal", `${slug}.txt`);
  const text = readFileSync(path, "utf-8");

  const normalizedText = text
    .replace(/\r/g, "")
    .replace(/^(Условия использования|Политика конфиденциальности|Публичная оферта|Соглашение на передачу и обработку персональных данных)\s+/u, "$1\n\n")
    .replace(/\s+(?=(\d+(?:\.\d+){0,2}\.\s*[А-ЯЁA-Z]))/g, "\n\n")
    .replace(/\s*●\s*/g, "\n● ")
    .replace(/\s*⚠\s*/g, "\n\n⚠ ")
    .replace(/\s*⛔\s*/g, "\n\n⛔ ")
    .replace(/:\n/g, ":\n\n")
    .replace(/\.\s+(?=Обработка персональных данных|Настоящее согласие действует|Настоящее согласие может быть отозвано|Общедоступная информация|Цели сбора|Пользователь предоставляет|Субъекты персональных данных|Условия обработки|Куки|При этом следует учесть|Затраты на доступ|Если вы опоздали|Администрация заведения)/g, ".\n\n")
    .replace(/([.!?])\s+(?=[А-ЯЁ][а-яё]+(?:\s+[А-ЯЁа-яё]+){0,5}:)/g, "$1\n\n");

  return normalizedText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
