"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, PawPrint, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PiggyCard } from "@/components/piggy-card";

export function PiggyBrowser({ piggies }) {
  const [activeSlug, setActiveSlug] = useState(null);

  const activeIndex = useMemo(
    () => piggies.findIndex((piggy) => piggy.slug === activeSlug),
    [piggies, activeSlug]
  );
  const activePiggy = activeIndex >= 0 ? piggies[activeIndex] : null;

  const openPiggy = (slug) => setActiveSlug(slug);
  const closePiggy = () => setActiveSlug(null);
  const showPrevious = () =>
    setActiveSlug(piggies[(activeIndex - 1 + piggies.length) % piggies.length]?.slug || null);
  const showNext = () => setActiveSlug(piggies[(activeIndex + 1) % piggies.length]?.slug || null);

  return (
    <>
      <div className="card-grid card-grid-3">
        {piggies.map((piggy) => (
          <PiggyCard key={piggy.slug} piggy={piggy} onOpen={openPiggy} />
        ))}
      </div>

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
                    backgroundImage: `linear-gradient(180deg, rgba(12, 10, 8, 0.06), rgba(12, 10, 8, 0.22)), url(${activePiggy.image})`,
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

                  <div className="modal-nav-row">
                    <div className="modal-switchers">
                      <button type="button" className="button button-secondary" onClick={showPrevious}>
                        <ArrowLeft size={18} />
                        Назад
                      </button>
                      <button type="button" className="button button-secondary" onClick={showNext}>
                        Вперед
                        <ArrowRight size={18} />
                      </button>
                    </div>
                    <Link className="button button-primary" href="/booking">
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
