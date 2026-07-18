"use client";

import clsx from "clsx";
import { ArrowUpRight, BadgeCheck, CalendarDays, HeartHandshake, Sparkles } from "lucide-react";
import { useState } from "react";

const stepIcons = [BadgeCheck, CalendarDays, Sparkles, HeartHandshake];

function getProgressValue(index, total) {
  return Math.round(((index + 1) / total) * 100);
}

function getStepStatus(index, activeIndex) {
  if (index < activeIndex) {
    return "Шаг пройден";
  }

  if (index === activeIndex) {
    return "Сейчас в фокусе";
  }

  return "Следующий шаг";
}

export function VisitJourney({ steps }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const progressValue = getProgressValue(activeIndex, steps.length);

  return (
    <div className="journey-shell">
      <div className="card journey-progress-card">
        <div className="journey-progress-copy">
          <span className="journey-progress-label">Понятный путь к бронированию</span>
          <div className="journey-progress-stack">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={clsx("journey-progress-panel", index === activeIndex && "active")}
                aria-hidden={index !== activeIndex}
              >
                <h3>{step.title}</h3>
                <p>
                  <span className="copy-desktop">{step.description}</span>
                  <span className="copy-mobile">{step.mobileDescription || step.description}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="journey-progress-side">
          <div className="journey-progress-percent">
            <strong>{progressValue}%</strong>
            <span>пути открыто</span>
          </div>

          <div className="journey-progress-track" aria-hidden="true">
            <div
              className="journey-progress-fill"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      </div>

      <div className="journey-step-grid">
        {steps.map((step, index) => {
          const Icon = stepIcons[index] || Sparkles;
          const isActive = index === activeIndex;
          const progressStep = getProgressValue(index, steps.length);

          return (
            <button
              key={step.title}
              type="button"
              className={clsx("card journey-step-card", isActive && "active")}
              aria-pressed={isActive}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
            >
              {isActive ? <span className="journey-step-glow" /> : null}

              <div className="journey-step-topline">
                <span className="journey-step-number">0{index + 1}</span>
                <span className="journey-step-icon">
                  <Icon size={20} />
                </span>
              </div>

              <span className="journey-step-status">{getStepStatus(index, activeIndex)}</span>
              <h3>{step.title}</h3>
              <p>
                <span className="copy-desktop">{step.description}</span>
                <span className="copy-mobile">{step.mobileDescription || step.description}</span>
              </p>

              <div className="journey-step-footer">
                <span>{progressStep}% маршрута</span>
                <ArrowUpRight size={18} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
