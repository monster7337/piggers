"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Images, X } from "lucide-react";
import { useMemo, useState } from "react";
import { galleryCategories } from "@/lib/site-data";

export function GalleryFilter({ items, limit, showLink = false }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeIndex, setActiveIndex] = useState(null);

  const fullItems = useMemo(
    () => (activeCategory === "all" ? items : items.filter((item) => item.category === activeCategory)),
    [activeCategory, items]
  );

  const filteredItems = useMemo(() => {
    if (limit) {
      return fullItems.slice(0, limit);
    }

    return fullItems;
  }, [fullItems, limit]);

  const activeItem = activeIndex !== null ? fullItems[activeIndex] : null;

  const openItem = (itemId) => {
    const index = fullItems.findIndex((item) => item.id === itemId);

    if (index >= 0) {
      setActiveIndex(index);
    }
  };

  const closeItem = () => setActiveIndex(null);
  const showPrevious = () =>
    setActiveIndex((current) => (current === null ? 0 : (current - 1 + fullItems.length) % fullItems.length));
  const showNext = () =>
    setActiveIndex((current) => (current === null ? 0 : (current + 1) % fullItems.length));

  return (
    <div className="gallery-shell">
      <div className="chip-row">
        {galleryCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={clsx("chip-button", activeCategory === category.id && "active")}
            onClick={() => {
              setActiveCategory(category.id);
              setActiveIndex(null);
            }}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="gallery-card"
            onClick={() => openItem(item.id)}
            aria-label={item.title}
          >
            <span
              className="gallery-card-media"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(12, 10, 8, 0.04), rgba(12, 10, 8, 0.34)), url(${item.image})`,
                backgroundPosition: item.position
              }}
            />
            <span className="gallery-card-copy">
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </span>
          </button>
        ))}
      </div>

      {showLink ? (
        <div className="section-actions">
          <button type="button" className="button button-secondary" onClick={() => setActiveIndex(0)}>
            <Images size={18} />
            Открыть всю галерею
          </button>
        </div>
      ) : null}

      <AnimatePresence>
        {activeItem ? (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="lightbox-backdrop" type="button" onClick={closeItem} />
            <motion.div
              className="lightbox-panel gallery-browser-panel"
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.24 }}
            >
              <button type="button" className="lightbox-close" onClick={closeItem} aria-label="Закрыть">
                <X size={20} />
              </button>

              <div
                className="lightbox-media"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(12, 10, 8, 0.08), rgba(12, 10, 8, 0.18)), url(${activeItem.image})`,
                  backgroundPosition: activeItem.position
                }}
              />
              <div className="lightbox-copy">
                <div className="gallery-browser-topline">
                  <div>
                    <h3>{activeItem.title}</h3>
                    <p>{activeItem.description}</p>
                  </div>
                  <span className="soft-badge">
                    {activeIndex + 1} / {fullItems.length}
                  </span>
                </div>

                <div className="modal-nav-row">
                  <div className="modal-switchers">
                    <button type="button" className="button button-secondary" onClick={showPrevious}>
                      <ArrowLeft size={18} />
                      Предыдущее
                    </button>
                    <button type="button" className="button button-secondary" onClick={showNext}>
                      Следующее
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
