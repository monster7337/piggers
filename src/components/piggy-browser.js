"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Heart, PawPrint, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { withBasePath } from "@/lib/base-path";
import { PiggyCard } from "@/components/piggy-card";

export function PiggyBrowser({ piggies, mobilePreviewCount }) {
  const [activeSlug, setActiveSlug] = useState(null);
  const lockedScrollRef = useRef(0);

  const activeIndex = useMemo(
    () => piggies.findIndex((piggy) => piggy.slug === activeSlug),
    [piggies, activeSlug]
  );
  const activePiggy = activeIndex >= 0 ? piggies[activeIndex] : null;
  const isModalOpen = activeSlug !== null;
  const hiddenPiggySlug =
    mobilePreviewCount && piggies.length > mobilePreviewCount ? piggies[mobilePreviewCount]?.slug : null;

  const openPiggy = (slug) => setActiveSlug(slug);
  const closePiggy = () => setActiveSlug(null);
  const showPrevious = () =>
    setActiveSlug(piggies[(activeIndex - 1 + piggies.length) % piggies.length]?.slug || null);
  const showNext = () => setActiveSlug(piggies[(activeIndex + 1) % piggies.length]?.slug || null);

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    lockedScrollRef.current = window.scrollY;
    const html = document.documentElement;
    const body = document.body;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveSlug(null);
      }

      if (event.key === "ArrowLeft") {
        setActiveSlug((currentSlug) => {
          const currentIndex = piggies.findIndex((piggy) => piggy.slug === currentSlug);

          return piggies[(currentIndex - 1 + piggies.length) % piggies.length]?.slug || null;
        });
      }

      if (event.key === "ArrowRight") {
        setActiveSlug((currentSlug) => {
          const currentIndex = piggies.findIndex((piggy) => piggy.slug === currentSlug);

          return piggies[(currentIndex + 1) % piggies.length]?.slug || null;
        });
      }
    };

    html.classList.add("modal-open");
    body.classList.add("modal-open");
    body.style.position = "fixed";
    body.style.top = `-${lockedScrollRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      const previousScrollBehavior = html.style.scrollBehavior;

      html.style.scrollBehavior = "auto";
      html.classList.remove("modal-open");
      body.classList.remove("modal-open");

      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";

      window.scrollTo(0, lockedScrollRef.current);

      window.requestAnimationFrame(() => {
        html.style.scrollBehavior = previousScrollBehavior;
      });
    };
  }, [isModalOpen, piggies]);

  return (
    <>
      <div className="card-grid card-grid-3 piggy-browser-grid">
        {piggies.map((piggy, index) => (
          <div
            key={piggy.slug}
            className={index >= mobilePreviewCount ? "piggy-browser-item piggy-browser-item-hidden-mobile" : "piggy-browser-item"}
          >
            <PiggyCard piggy={piggy} onOpen={openPiggy} />
          </div>
        ))}
      </div>

      {hiddenPiggySlug ? (
        <div className="section-actions piggy-browser-actions">
          <button type="button" className="button button-secondary" onClick={() => openPiggy(hiddenPiggySlug)}>
            Посмотреть всех
          </button>
        </div>
      ) : null}

      <AnimatePresence>
        {activePiggy ? (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="lightbox-backdrop" type="button" onClick={closePiggy} />
            <motion.div
              className="lightbox-panel piggy-modal"
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.24 }}
            >
              <button type="button" className="lightbox-close" onClick={closePiggy} aria-label="Закрыть">
                <X size={20} />
              </button>

              <div className="piggy-modal-grid">
                <div
                  className="piggy-modal-media"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(12, 10, 8, 0.06), rgba(12, 10, 8, 0.22)), url(${withBasePath(activePiggy.image)})`,
                    backgroundPosition: activePiggy.imagePosition
                  }}
                />

                <div className="piggy-modal-copy">
                  <span className="eyebrow">Наш минипиг</span>
                  <div className="card-topline">
                    <h3>{activePiggy.name}</h3>
                    <span className="soft-badge">{activePiggy.age}</span>
                  </div>
                  <p className="piggy-modal-lead">{activePiggy.character}</p>
                  <p className="muted-text">{activePiggy.trait}</p>

                  <div className="piggy-modal-columns">
                    <div className="card piggy-detail-card">
                      <h4>
                        <Heart size={18} />
                        Любит
                      </h4>
                      <ul>
                        {activePiggy.likes.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="card piggy-detail-card">
                      <h4>
                        <PawPrint size={18} />
                        Интересные факты
                      </h4>
                      <ul>
                        {activePiggy.facts.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="piggy-modal-action-bar">
                    <div className="piggy-modal-switchers">
                      <button
                        type="button"
                        className="button button-secondary piggy-modal-switch-button"
                        onClick={showPrevious}
                        aria-label="Предыдущий минипиг"
                      >
                        <ArrowLeft size={18} />
                        <span className="piggy-modal-switch-label">Назад</span>
                      </button>
                      <button
                        type="button"
                        className="button button-secondary piggy-modal-switch-button"
                        onClick={showNext}
                        aria-label="Следующий минипиг"
                      >
                        <ArrowRight size={18} />
                        <span className="piggy-modal-switch-label">Вперед</span>
                      </button>
                    </div>
                    <Link className="button button-primary piggy-modal-booking" href="/booking">
                      <CalendarDays size={18} />
                      Забронировать визит
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
