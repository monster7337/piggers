"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function FaqAccordion({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const isOpen = activeIndex === index;

        return (
          <div key={item.question} className={clsx("faq-item", isOpen && "open")}>
            <button
              type="button"
              className="faq-trigger"
              onClick={() => setActiveIndex(isOpen ? -1 : index)}
            >
              <span>{item.question}</span>
              <ChevronDown size={18} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  className="faq-answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <p>{item.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

