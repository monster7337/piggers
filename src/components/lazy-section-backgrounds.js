"use client";

import { useEffect } from "react";

export function LazySectionBackgrounds() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll(".site-main > .section"));

    if (!("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("lazy-background-ready"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("lazy-background-ready");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return null;
}
