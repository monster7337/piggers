"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const MOBILE_REVEAL_QUERY = "(max-width: 820px)";

export function AnimatedSection({ id, className, children }) {
  const prefersReducedMotion = useReducedMotion();
  const [animationMode, setAnimationMode] = useState("pending");
  const sectionClassName = clsx("section", className);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_REVEAL_QUERY);

    const updateAnimationMode = () => {
      setAnimationMode(mediaQuery.matches || prefersReducedMotion ? "static" : "animated");
    };

    updateAnimationMode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateAnimationMode);

      return () => mediaQuery.removeEventListener("change", updateAnimationMode);
    }

    mediaQuery.addListener(updateAnimationMode);

    return () => mediaQuery.removeListener(updateAnimationMode);
  }, [prefersReducedMotion]);

  // Keep sections visible until the client confirms a desktop viewport.
  if (animationMode !== "animated") {
    return (
      <section id={id} className={sectionClassName}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      className={sectionClassName}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );
}

