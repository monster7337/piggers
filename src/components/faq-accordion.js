import { ChevronDown } from "lucide-react";

export function FaqAccordion({ items }) {
  return (
    <div className="faq-list">
      {items.map((item, index) => (
          <details key={item.question} className="faq-item" open={index === 0 ? true : undefined}>
            <summary className="faq-trigger">
              <span>{item.question}</span>
              <ChevronDown size={18} />
            </summary>
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
          </details>
      ))}
    </div>
  );
}
