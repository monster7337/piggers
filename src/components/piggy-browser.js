"use client";

import { ArrowLeft, ArrowRight, CalendarDays, Heart, PawPrint, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { withBasePath } from "@/lib/base-path";
import { PiggyCard } from "@/components/piggy-card";

export function PiggyBrowser({ piggies, previewCount }) {
  const [activeSlug, setActiveSlug] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);
  const lockedScrollRef = useRef(0);
  const activeSelectorRef = useRef(null);

  const activeIndex = useMemo(
    () => piggies.findIndex((piggy) => piggy.slug === activeSlug),
    [piggies, activeSlug]
  );
  const activePiggy = activeIndex >= 0 ? piggies[activeIndex] : null;
  const isDetailOpen = activeSlug !== null;
  const isOverlayOpen = isDetailOpen || isGalleryOpen;
  const previewPiggies = previewCount ? piggies.slice(0, previewCount) : piggies;
  const hasHiddenPiggies = previewPiggies.length < piggies.length;

  const openPiggy = (slug, preserveGallery = false) => {
    if (!slug) {
      return;
    }

    const nextIndex = piggies.findIndex((piggy) => piggy.slug === slug);

    setIsGalleryOpen(preserveGallery);
    setActiveSlug(slug);
  };
  const openGallery = () => {
    if (!piggies.length) {
      return;
    }

    if (!isMobile) {
      openPiggy(piggies[0]?.slug || null);
      return;
    }

    setActiveSlug(null);
    setIsGalleryOpen(true);
  };
  const closeOverlay = () => {
    setIsGalleryOpen(false);
    setActiveSlug(null);
  };
  const closeDetail = () => setActiveSlug(null);
  const showPrevious = () => {
    setActiveSlug(piggies[(activeIndex - 1 + piggies.length) % piggies.length]?.slug || null);
  };
  const showNext = () => {
    setActiveSlug(piggies[(activeIndex + 1) % piggies.length]?.slug || null);
  };

  useEffect(() => {
    setPortalTarget(document.body);

    const mediaQuery = window.matchMedia("(max-width: 720px)");
    const syncViewport = () => setIsMobile(mediaQuery.matches);

    syncViewport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewport);
    } else {
      mediaQuery.addListener(syncViewport);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", syncViewport);
      } else {
        mediaQuery.removeListener(syncViewport);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOverlayOpen) {
      return undefined;
    }

    lockedScrollRef.current = window.scrollY;
    const html = document.documentElement;
    const body = document.body;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (isDetailOpen) {
          setActiveSlug(null);
          return;
        }

        setIsGalleryOpen(false);
        return;
      }

      if (!isDetailOpen) {
        return;
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
  }, [isDetailOpen, isOverlayOpen, piggies]);

  useEffect(() => {
    if (isMobile || !activeSelectorRef.current) {
      return;
    }

    activeSelectorRef.current.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: "smooth"
    });
  }, [activeSlug, isMobile]);

  const overlay = (
    <>
      {isGalleryOpen && !activePiggy ? (
        <div
          key="piggy-gallery"
          className="lightbox"
        >
          <button className="lightbox-backdrop" type="button" onClick={closeOverlay} />
          <div
            className="lightbox-panel piggy-gallery-modal"
          >
            <button type="button" className="lightbox-close" onClick={closeOverlay} aria-label="Закрыть">
              <X size={20} />
            </button>

            <div className="piggy-gallery-grid">
              {piggies.map((piggy) => (
                <button
                  key={piggy.slug}
                  type="button"
                  className="piggy-gallery-tile"
                  onClick={() => openPiggy(piggy.slug, true)}
                  aria-label={`Открыть карточку минипига ${piggy.name}`}
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(24, 19, 16, 0.04), rgba(24, 19, 16, 0.16)), url(${withBasePath(piggy.image)})`,
                    backgroundPosition: piggy.imagePosition
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activePiggy ? (
        <div
          key="piggy-detail"
          className="lightbox"
        >
          <button className="lightbox-backdrop" type="button" onClick={closeDetail} />
          <div
            className="lightbox-panel piggy-modal"
          >
            <button type="button" className="lightbox-close" onClick={closeDetail} aria-label="Закрыть">
              <X size={20} />
            </button>

              <div
                key={activePiggy.slug}
                className="piggy-modal-grid"
              >
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
                    <span className="soft-badge">{activePiggy.badge || activePiggy.age}</span>
                  </div>
                  <p className="piggy-modal-lead">{activePiggy.character}</p>
                  {activePiggy.trait ? <p className="muted-text">{activePiggy.trait}</p> : null}

                  {!isMobile ? (
                    <div className="piggy-modal-selector">
                      {piggies.map((piggy) => (
                        <button
                          key={piggy.slug}
                          ref={piggy.slug === activePiggy.slug ? activeSelectorRef : null}
                          type="button"
                          className={`piggy-selector-card ${piggy.slug === activePiggy.slug ? "active" : ""}`}
                          onClick={() => openPiggy(piggy.slug)}
                          style={{
                            backgroundImage: `linear-gradient(180deg, rgba(17, 17, 17, 0.08), rgba(17, 17, 17, 0.28)), url(${withBasePath(piggy.image)})`,
                            backgroundPosition: piggy.imagePosition
                          }}
                        >
                          <span>{piggy.name}</span>
                          <small>{piggy.badge || piggy.age}</small>
                        </button>
                      ))}
                    </div>
                  ) : null}

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
                    <Link className="button button-primary piggy-modal-booking" href="/booking" prefetch={false}>
                      <CalendarDays size={18} />
                      Забронировать визит
                    </Link>
                  </div>
                </div>
              </div>
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <>
      <div className="card-grid card-grid-3 piggy-browser-grid">
        {previewPiggies.map((piggy) => (
          <div key={piggy.slug} className="piggy-browser-item">
            <PiggyCard piggy={piggy} onOpen={openPiggy} />
          </div>
        ))}
      </div>

      {hasHiddenPiggies ? (
        <div className="section-actions piggy-browser-actions">
          <button type="button" className="button button-secondary" onClick={openGallery}>
            Посмотреть всех
          </button>
        </div>
      ) : null}
      {portalTarget ? createPortal(overlay, portalTarget) : null}
    </>
  );
}
