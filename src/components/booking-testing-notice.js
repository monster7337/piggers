"use client";

import { CircleAlert, Phone, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export function BookingTestingNotice({ isOpen, onClose, phone, phoneHref }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const html = document.documentElement;
    const body = document.body;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    html.classList.add("modal-open");
    body.classList.add("modal-open");
    body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      html.classList.remove("modal-open");
      body.classList.remove("modal-open");
      body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="booking-gate booking-gate-piggy booking-testing-notice">
      <button type="button" className="booking-gate-backdrop" aria-label="Закрыть уведомление" onClick={onClose} />
      <section className="booking-gate-card" role="dialog" aria-modal="true" aria-labelledby="piggy-booking-testing-title">
        <button type="button" className="booking-gate-close" onClick={onClose} aria-label="Закрыть">
          <X size={18} />
        </button>

        <div className="booking-gate-hero">
          <span className="booking-testing-notice-kicker">
            <CircleAlert size={15} />
            Важная информация
          </span>
          <h2 id="piggy-booking-testing-title">Онлайн-запись временно тестируется</h2>
        </div>

        <div className="booking-gate-scroll booking-testing-notice-copy">
          <p>После заполнения формы заявка не будет создана, а оплата на сайте сейчас недоступна.</p>
          <p>Чтобы уточнить свободное время и записаться, пожалуйста, свяжитесь с администратором.</p>
          <a className="button button-secondary booking-testing-notice-phone" href={phoneHref}>
            <Phone size={17} />
            Позвонить: {phone}
          </a>
        </div>

        <div className="booking-gate-actions">
          <button type="button" className="button button-primary booking-gate-confirm" onClick={onClose}>
            Понятно
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}
