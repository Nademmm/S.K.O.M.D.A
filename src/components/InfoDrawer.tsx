"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORY_LABEL, type ExhibitItem } from "@/utils/museumData";
import styles from "./InfoDrawer.module.css";

interface InfoDrawerProps {
  /** Selected exhibit; null means the drawer is closed */
  item: ExhibitItem | null;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Museum artifact information panel.
 *
 * A floating asymmetric surface that emerges from the environment.
 * Information is discovered, not displayed. Typography is the hero.
 *
 * Motion: slow, calm, confident — like an object gently settling into space.
 * Surface: layered materials with editorial rhythm.
 * Accent: appears only at the hairline rule. Restrained.
 */
export default function InfoDrawer({ item, onClose }: InfoDrawerProps) {
  const open = item !== null;
  const [displayItem, setDisplayItem] = useState<ExhibitItem | null>(item);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = "info-drawer-title";

  // Keep content visible during close animation
  useEffect(() => {
    if (item) {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayItem(item);
    } else {
      closeTimer.current = setTimeout(() => setDisplayItem(null), 800);
    }
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [item]);

  // Escape key closes drawer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus management: trap focus inside dialog, restore on close
  useEffect(() => {
    if (!open || !dialogRef.current) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const dialog = dialogRef.current;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

  const accent = displayItem?.color ?? "#9a9590";

  return (
    <>
      {/* Scrim — barely-there veil; museum remains visible */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`${styles.scrim} ${open ? styles.scrimOpen : ""}`}
      />

      {/* Floating composition */}
      <div className={styles.positioner}>
        <AnimatePresence>
          {open && displayItem && (
            <motion.aside
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={`${styles.panel} ${styles.panelOpen}`}
              style={{ "--accent": accent } as React.CSSProperties}
              // Motion: opacity + subtle translation + tiny scale. No bounce.
              initial={{ opacity: 0, y: 14, scale: 0.975 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.985 }}
              transition={{
                duration: 0.72,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Layer 2: Darker reading surface, slightly inset */}
              <div className={styles.innerSurface}>
                {/* Top row: category + close glyph */}
                <div className={styles.topRow}>
                  <span className={styles.categoryLabel}>
                    {CATEGORY_LABEL[displayItem.category]}
                  </span>
                  <button
                    ref={closeBtnRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className={styles.closeGlyph}
                  >
                    <span aria-hidden="true" style={{ fontWeight: 100, fontSize: 15, lineHeight: 1 }}>
                      ×
                    </span>
                  </button>
                </div>

                {/* Title — the hero of the composition */}
                <h2 id={titleId} className={styles.title}>
                  {displayItem.title}
                </h2>

                {/* Hairline rule — the only place accent color appears */}
                <div
                  className={styles.accentLine}
                  aria-hidden="true"
                  style={{ background: accent }}
                />

                {/* Scrollable content: quote + description */}
                <div className={styles.contentArea}>
                  <p className={styles.pullQuote}>
                    &ldquo;{displayItem.highlight}&rdquo;
                  </p>
                  <p className={styles.bodyText}>{displayItem.description}</p>
                </div>

                {/* Action — visible, accessible, still integrated */}
                <div style={{ marginTop: "auto", paddingTop: 36 }}>
                  <button
                    type="button"
                    onClick={onClose}
                    className={styles.actionText}
                    aria-label="Close panel and return to exploring the museum"
                  >
                    Kembali Menjelajah
                    <span className={styles.actionArrow} aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
