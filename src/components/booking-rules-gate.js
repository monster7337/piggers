"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, PawPrint, ShieldCheck, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { stripBasePath } from "@/lib/base-path";

const OPEN_EVENT = "piggy-land:booking-gate-open";
const BOOKING_DRAFT_STORAGE_KEY = "piggyland-booking-draft";
const GIFT_DRAFT_STORAGE_KEY = "piggyland-gift-draft";

const rules = [
  "Помните: вы в гостях у животных, а не на аттракционе. Животных нельзя принуждать к общению — слушайте инструкторов, чтобы всем было комфортно.",
  "Дети до 12 лет могут находиться с животными только со взрослым сопровождающим. Билет нужен каждому.",
  "Не опаздывайте — время сеанса сокращается, а продлить его нельзя."
];

function normalizePathname(pathname) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function requestBookingGate(href = "/booking") {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { href } }));
}

function isGatedPath(pathname) {
  const normalizedPathname = normalizePathname(pathname);
  return normalizedPathname === "/booking" || normalizedPathname === "/gift-certificates";
}

function hasDraftForPath(href) {
  if (typeof window === "undefined") {
    return false;
  }

  const url = new URL(href, window.location.href);
  const targetPathname = normalizePathname(stripBasePath(url.pathname));

  if (targetPathname === "/booking") {
    return Boolean(window.sessionStorage.getItem(BOOKING_DRAFT_STORAGE_KEY));
  }

  if (targetPathname === "/gift-certificates") {
    return Boolean(window.sessionStorage.getItem(GIFT_DRAFT_STORAGE_KEY));
  }

  return false;
}

export function BookingRulesGate() {
  const router = useRouter();
  const pathname = normalizePathname(stripBasePath(usePathname()));
  const [pendingHref, setPendingHref] = useState("/booking");
  const [isOpen, setIsOpen] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(() => rules.map(() => false));

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (!isOpen) {
      html.classList.remove("modal-open");
      body.classList.remove("modal-open");
      body.style.overflow = "";
      return undefined;
    }

    html.classList.add("modal-open");
    body.classList.add("modal-open");
    body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      html.classList.remove("modal-open");
      body.classList.remove("modal-open");
      body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleOpenRequest = (event) => {
      const href = event.detail?.href || "/booking";

      if (hasDraftForPath(href)) {
        router.push(href);
        return;
      }

      setPendingHref(href);
      setAcceptedRules(rules.map(() => false));
      setIsOpen(true);
    };

    const handleDocumentClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;

      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      const targetPathname = normalizePathname(stripBasePath(url.pathname));
      const nextHref = `${url.pathname}${url.search}${url.hash}`;

      if (pathname !== "/" || url.origin !== window.location.origin || !isGatedPath(targetPathname)) {
        return;
      }

      if (hasDraftForPath(nextHref)) {
        return;
      }

      event.preventDefault();
      setPendingHref(nextHref);
      setAcceptedRules(rules.map(() => false));
      setIsOpen(true);
    };

    window.addEventListener(OPEN_EVENT, handleOpenRequest);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener(OPEN_EVENT, handleOpenRequest);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [pathname, router]);

  const close = () => {
    setAcceptedRules(rules.map(() => false));
    setIsOpen(false);
  };

  const allAccepted = acceptedRules.every(Boolean);

  const toggleRule = (index) => {
    setAcceptedRules((current) => current.map((value, currentIndex) => (currentIndex === index ? !value : value)));
  };

  const proceed = () => {
    if (!allAccepted) {
      return;
    }

    setAcceptedRules(rules.map(() => false));
    setIsOpen(false);
    router.push(pendingHref);
  };

  const portalTarget = typeof document !== "undefined" ? document.body : null;

  if (!portalTarget) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="booking-gate booking-gate-piggy"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            className="booking-gate-backdrop"
            aria-label="Закрыть окно с правилами"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="booking-gate-card"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="piggy-booking-gate-title"
          >
            <button type="button" className="booking-gate-close" onClick={close} aria-label="Закрыть">
              <X size={18} />
            </button>

            <div className="booking-gate-hero">
              <span className="booking-gate-pill">
                <Sparkles size={14} />
                Перед бронированием
              </span>
              <h2 id="piggy-booking-gate-title">Небольшие правила для спокойного и тёплого визита</h2>
              <p>Мы хотим, чтобы гостям было уютно, а животным спокойно. Перед записью важно подтвердить три простых пункта.</p>
            </div>

            <div className="booking-gate-rule-list">
              {rules.map((rule, index) => (
                <button
                  key={rule}
                  type="button"
                  className="booking-gate-rule"
                  onClick={() => toggleRule(index)}
                  aria-pressed={acceptedRules[index]}
                >
                  <span className="booking-gate-rule-icon">
                    <PawPrint size={16} />
                  </span>
                  <span>{rule}</span>
                  <span className={`booking-gate-rule-check ${acceptedRules[index] ? "checked" : ""}`}>
                    {acceptedRules[index] ? <Check size={16} /> : null}
                  </span>
                </button>
              ))}
            </div>

            <div className="booking-gate-note">
              <ShieldCheck size={18} />
              <span>Продолжая, вы подтверждаете, что готовы соблюдать правила поведения в пространстве.</span>
            </div>

            <div className="booking-gate-actions">
              <button type="button" className="button button-secondary" onClick={close}>
                Вернуться
              </button>
              <button
                type="button"
                className="button button-primary booking-gate-confirm"
                onClick={proceed}
                disabled={!allAccepted}
              >
                <Heart size={16} />
                Перейти к оформлению
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    portalTarget
  );
}
