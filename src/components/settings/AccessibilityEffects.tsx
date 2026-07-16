"use client";

import { useEffect } from "react";
import { useSettings } from "@/settings/SettingsContext";

/**
 * Menerapkan pengaturan accessibility ke seluruh dokumen sebagai efek samping:
 * high contrast, large text, reduce motion, dan color blind filter.
 *
 * Filter buta warna memakai matriks SVG (LMS daltonization sederhana) yang
 * dipasang sekali, lalu di-attach ke <html> via CSS `filter`.
 * Komponen ini tidak merender UI kasat mata (kecuali <svg> filter tersembunyi).
 */
export default function AccessibilityEffects() {
  const { settings } = useSettings();
  const {
    highContrast,
    largeText,
    reduceMotion,
    colorBlindMode,
  } = settings;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("skomda-high-contrast", highContrast);
    root.classList.toggle("skomda-large-text", largeText);
    root.classList.toggle("skomda-reduce-motion", reduceMotion);

    root.style.filter =
      colorBlindMode === "off" ? "" : `url(#skomda-cb-${colorBlindMode})`;

    return () => {
      root.classList.remove(
        "skomda-high-contrast",
        "skomda-large-text",
        "skomda-reduce-motion"
      );
      root.style.filter = "";
    };
  }, [highContrast, largeText, reduceMotion, colorBlindMode]);

  return (
    <svg
      aria-hidden="true"
      style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
    >
      <defs>
        {/* Matriks simulasi buta warna (sumber: Machado et al. approximations) */}
        <filter id="skomda-cb-protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0 0 0
                    0.558 0.442 0 0 0
                    0 0.242 0.758 0 0
                    0 0 0 1 0"
          />
        </filter>
        <filter id="skomda-cb-deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0 0 0
                    0.7 0.3 0 0 0
                    0 0.3 0.7 0 0
                    0 0 0 1 0"
          />
        </filter>
        <filter id="skomda-cb-tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95 0.05 0 0 0
                    0 0.433 0.567 0 0
                    0 0.475 0.525 0 0
                    0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}
