"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { stripBasePath, withBasePath } from "@/lib/base-path";
import { contactInfo, navigation } from "@/lib/site-data";

function getBasePath(href) {
  return href.split("#")[0] || "/";
}

export function Header() {
  const pathname = stripBasePath(usePathname());
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const isScrolledRef = useRef(false);
  const activeSectionRef = useRef("home");
  const isHomeHero = pathname === "/";

  useEffect(() => {
    let frameId = 0;

    const handleScroll = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        const scrollY = window.scrollY;
        const nextScrolled = isScrolledRef.current ? scrollY > 6 : scrollY > 36;

        if (nextScrolled !== isScrolledRef.current) {
          isScrolledRef.current = nextScrolled;
          setIsScrolled(nextScrolled);
        }

        if (pathname !== "/") {
          return;
        }

        const currentPoint = scrollY + 180;
        let currentSection = "home";

        navigation.forEach((item) => {
          if (!item.section) {
            return;
          }

          const element = document.getElementById(item.section);

          if (element && element.offsetTop <= currentPoint) {
            currentSection = item.section;
          }
        });

        if (currentSection !== activeSectionRef.current) {
          activeSectionRef.current = currentSection;
          setActiveSection(currentSection);
        }
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [pathname]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className={clsx("site-header", isHomeHero && "home-hero", isScrolled && "scrolled")}>
      <div className="container header-inner">
        <a className="brand-lockup brand-lockup-compact" href={withBasePath("/#home")} aria-label="Piggy Land">
          <span className="brand-badge brand-badge-logo">
            <img
              src={withBasePath("/images/piggilandlogo-icon.webp")}
              alt=""
              className="brand-logo-image"
              width="48"
              height="48"
              decoding="async"
              fetchPriority={isHomeHero ? "high" : "auto"}
            />
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Основная навигация">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={withBasePath(item.href)}
              className={clsx(
                "nav-link",
                pathname === "/"
                  ? activeSection === item.section && "active"
                  : pathname === getBasePath(item.href) && "active"
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a className="contact-pill" href={contactInfo.phoneLink}>
            <Phone size={16} />
            <span>{contactInfo.phone}</span>
          </a>
          <Link className="button button-primary header-booking-button" href="/booking">
            Забронировать сеанс
          </Link>
          <a className="mobile-header-call" href={contactInfo.phoneLink} aria-label="Позвонить">
            <Phone size={18} />
          </a>
          <Link className="mobile-header-booking" href="/booking">
            Забронировать
          </Link>
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24 }}
          >
            <div className="container mobile-menu-inner">
              <nav className="mobile-nav" aria-label="Мобильная навигация">
                {navigation.map((item) => (
                  <a
                    key={item.href}
                    href={withBasePath(item.href)}
                    onClick={() => setIsOpen(false)}
                    className={clsx(
                      "mobile-nav-link",
                      pathname === "/"
                        ? activeSection === item.section && "active"
                        : pathname === getBasePath(item.href) && "active"
                    )}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="mobile-menu-cta">
                <a className="contact-pill" href={contactInfo.phoneLink}>
                  <Phone size={16} />
                  <span>{contactInfo.phone}</span>
                </a>
                <Link className="button button-primary button-block" href="/booking" onClick={() => setIsOpen(false)}>
                  Перейти к бронированию
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
