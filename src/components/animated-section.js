"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";

export function AnimatedSection({ id, className, children }) {
  const prefersReducedMotion = useReducedMotion();
  const sectionClassName = clsx("section", className);

  if (prefersReducedMotion) {
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
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

