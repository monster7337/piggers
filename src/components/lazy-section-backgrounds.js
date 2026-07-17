"use client";

import { useEffect } from "react";

export function LazySectionBackgrounds() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll(".site-main > .section"));
    const images = Array.from(document.querySelectorAll("img[data-deferred-src]"));

    const revealImage = (image) => {
      const source = image.dataset.deferredSrc;

      if (source) {
        image.src = source;
        image.removeAttribute("data-deferred-src");
      }
    };

    if (!("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("lazy-background-ready"));
      images.forEach(revealImage);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target instanceof HTMLImageElement) {
            revealImage(entry.target);
          } else {
            entry.target.classList.add("lazy-background-ready");
          }
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px" }
    );

    sections.forEach((section) => observer.observe(section));
    images.forEach((image) => observer.observe(image));
    return () => observer.disconnect();
  }, []);

  return null;
}
