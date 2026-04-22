"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

const heroBenefits = [
  {
    desktop: "11 мини и микро пигов разных пород и возрастов",
    mobile: "11 минипигов"
  },
  {
    desktop: "чай, кофе и сладости входят в стоимость",
    mobile: "чай и вкусняшки включены"
  },
  {
    desktop: "животные имеют все необходимые прививки",
    mobile: "прививки и уход под контролем"
  },
  {
    desktop: "инструктаж по технике безопасности",
    mobile: "инструктаж перед визитом"
  },
  {
    desktop: "санитарный час перед каждым интервалом",
    mobile: "санитарный режим"
  },
  {
    desktop: "яркие фотолокации",
    mobile: "яркие фото"
  },
  {
    desktop: "аренда залов под мероприятия",
    mobile: "праздники и мероприятия"
  }
];

export function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="hero-background">
        <Image
          src={withBasePath("/images/piggyland-hero.png")}
          alt="Минипиги на солнечной ферме рядом с красным амбаром"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "72% 52%" }}
        />
      </div>

      <div className="container hero-fullscreen-content hero-fullscreen-grid">
        <motion.div
          className="hero-copy hero-copy-overlay"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <motion.span
            className="eyebrow hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            РАБОТАЕМ ПО ПРЕДВАРИТЕЛЬНОЙ ЗАПИСИ
          </motion.span>
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            Piggy Land
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            <span className="copy-desktop">
              Антикафе с минипигами в Санкт-Петербурге, где можно провести время с милыми и дружелюбными минипигами.
            </span>
            <span className="copy-mobile">Антикафе с минипигами в центре Петербурга для теплого часа без суеты.</span>
          </motion.p>
          <motion.div
            className="hero-description"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            <p className="hero-copy-text">
              Здесь вы можете гладить, кормить и играть с минипигами, а также делать с ними фотографии.
            </p>
            <p className="hero-copy-text">
              Кроме того, гостей ждут чай, кофе и сладости, которые входят в стоимость посещения.
            </p>
            <p className="hero-copy-text-mobile">
              Фото, общение со свинками, чайная пауза и уютный визит в одном месте.
            </p>
          </motion.div>

          <motion.div
            className="hero-highlights"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.18
                }
              }
            }}
          >
            {heroBenefits.map((item) => (
              <motion.span
                key={item.desktop}
                className="highlight-pill"
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <span className="copy-desktop">{item.desktop}</span>
                <span className="copy-mobile">{item.mobile}</span>
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            className="button-row"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
          >
            <Link className="button button-primary hero-primary-cta" href="/booking">
              Забронировать посещение
            </Link>
            <a className="button button-secondary hero-secondary-cta" href="/#rates">
              Посмотреть тарифы
            </a>
          </motion.div>
        </motion.div>
        <div className="hero-empty-column" aria-hidden="true" />
      </div>
    </section>
  );
}
