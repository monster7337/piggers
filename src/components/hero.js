"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";
import { heroHighlights } from "@/lib/site-data";

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
            className="eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Работаем по предварительной записи
          </motion.span>
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            Piggy Land
            <span>Антикафе с минипигами в Санкт-Петербурге, куда хочется возвращаться за теплом и живым отдыхом.</span>
          </motion.h1>
          <motion.p
            className="hero-copy-text"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            Приглашаем в гости к нашим мини и микро пигам: вас ждут 11 свинок, красочные
            фотолокации, чайная комната со вкусняшками и форматы для дня рождения, девичника,
            корпоратива или романтического вечера.
          </motion.p>

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
            {heroHighlights.map((item) => (
              <motion.span
                key={item}
                className="highlight-pill"
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                {item}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            className="button-row"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
          >
            <Link className="button button-primary" href="/booking">
              Забронировать сеанс
            </Link>
            <Link className="button button-secondary" href="/#rates">
              Посмотреть тарифы
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
        <div className="hero-empty-column" aria-hidden="true" />
      </div>
    </section>
  );
}
