"use client";

import { AlertTriangle, CircleCheck, Shirt, Sparkles } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { SectionHeading } from "@/components/section-heading";

const allowed = [
  "Кормить животных предоставляемым антикафе кормом",
  "Фото и видеосъемка без вспышки",
  "Посещение людьми с ограниченными возможностями*",
  "С разрешения инструктора держать животных на руках",
  "Принимать участие в дрессировке животных"
];

const forbidden = [
  "Посещение заведения в алкогольном или наркотическом опьянении",
  "Громкие звуки и резкие движения",
  "Приносить с собой и давать животным свой корм",
  "Приходить со своими животными",
  "Нахождение детей до 12 лет без сопровождения родителей",
  "Жестокое обращение с животными",
  "Контакт при признаках аллергии"
];

const wardrobe = ["удлиненные рукава", "штаны", "брюки", "джинсы из плотных тканей", "спортивная одежда"];
const avoidWardrobe = ["шорты", "футболки", "короткие платья и юбки"];

function RulesList({ title, Icon, items, tone }) {
  return (
    <article className={`animal-rules-card animal-rules-card-${tone}`}>
      <div className="animal-rules-card-head">
        <div className={`animal-rules-icon animal-rules-icon-${tone}`}>
          <Icon size={20} />
        </div>
        <h3>{title}</h3>
      </div>
      <ol className="animal-rules-list">
        {items.map((item, index) => (
          <li key={item} className="animal-rules-list-item">
            <span className={`animal-rules-badge animal-rules-badge-${tone}`}>{index + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}

export function AnimalRules() {
  return (
    <AnimatedSection id="rules" className="animal-rules-section">
      <div className="container">
        <SectionHeading
          eyebrow="Правила посещения"
          title="Правила общения с животными"
          description="Кратко и понятно: что разрешено, что запрещено и какой гардероб подойдет для контакта с животными."
          mobileDescription="Что разрешено, что запрещено и как лучше одеться для контакта с минипигами."
        />

        <div className="animal-rules-grid">
          <RulesList title="У нас можно" Icon={CircleCheck} items={allowed} tone="success" />
          <RulesList title="У нас нельзя" Icon={AlertTriangle} items={forbidden} tone="warning" />
        </div>

        <article className="animal-rules-wardrobe">
          <div className="animal-rules-wardrobe-main">
            <div className="animal-rules-card-head">
              <div className="animal-rules-icon animal-rules-icon-neutral">
                <Shirt size={20} />
              </div>
              <h3>Рекомендуем</h3>
            </div>
            <p>
              Для контакта с животными правильно подбирайте гардероб. Подойдут:
            </p>
            <div className="animal-rules-tags">
              {wardrobe.map((item) => (
                <span key={item} className="animal-rules-tag">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="animal-rules-note">
            <div className="animal-rules-card-head animal-rules-card-head-compact">
              <div className="animal-rules-icon animal-rules-icon-soft">
                <Sparkles size={18} />
              </div>
              <h3>Не рекомендуем</h3>
            </div>
            <p>{avoidWardrobe.join(", ")}.</p>
          </div>
        </article>
      </div>
    </AnimatedSection>
  );
}
