"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

export function AnimatedSection({ id, className, children }) {
  return (
    <motion.section
      id={id}
      className={clsx("section", className)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );
}

