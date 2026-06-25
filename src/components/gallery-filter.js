"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Images, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { withBasePath } from "@/lib/base-path";
import { galleryCategories } from "@/lib/site-data";

export function GalleryFilter({ items, limit, allCategoryLimit, showLink = false }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeIndex, setActiveIndex] = useState(null);
  const [portalTarget, setPortalTarget] = useState(null);
  const lockedScrollRef = useRef(0);

  const fullItems = useMemo(
    () => (activeCategory === "all" ? items : items.filter((item) => item.category === activeCategory)),
    [activeCategory, items]
  );

  const filteredItems = useMemo(() => {
    const activeLimit = activeCategory === "all" && allCategoryLimit ? allCategoryLimit : limit;

    if (activeLimit) {
      return fullItems.slice(0, activeLimit);
    }

    return fullItems;
  }, [activeCategory, allCategoryLimit, fullItems, limit]);

  const activeItem = activeIndex !== null ? fullItems[activeIndex] : null;
  const isModalOpen = activeIndex !== null;

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

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    lockedScrollRef.current = window.scrollY;
    const html = document.documentElement;
    const body = document.body;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current === null ? 0 : (current - 1 + fullItems.length) % fullItems.length));
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current === null ? 0 : (current + 1) % fullItems.length));
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
  }, [isModalOpen, fullItems.length]);

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
                backgroundImage: `linear-gradient(180deg, rgba(12, 10, 8, 0.04), rgba(12, 10, 8, 0.34)), url(${withBasePath(item.image)})`,
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

      {portalTarget
        ? createPortal(
            <AnimatePresence>
              {activeItem ? (
                <motion.div
                  className="lightbox"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeItem}
                >
                  <div className="lightbox-backdrop" aria-hidden="true" />
                  <motion.div
                    className="lightbox-panel gallery-browser-panel"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    onClick={(event) => event.stopPropagation()}
                  >
              <button type="button" className="lightbox-close" onClick={closeItem} aria-label="Закрыть">
                <X size={20} />
              </button>

              <div
                className="lightbox-media"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(12, 10, 8, 0.08), rgba(12, 10, 8, 0.18)), url(${withBasePath(activeItem.image)})`,
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
            </AnimatePresence>,
            portalTarget
          )
        : null}
    </div>
  );
}
