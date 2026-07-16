"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CATEGORY_LABEL,
  getPrevExhibit,
  getNextExhibit,
  type ExhibitItem,
} from "@/utils/museumData";
import styles from "./InfoDrawer.module.css";

// ─── Props ────────────────────────────────────────────────────────────────────

interface InfoDrawerProps {
  /** Selected exhibit; null means the drawer is closed */
  item: ExhibitItem | null;
  /** True when the drawer is in "showcasing" state — enables Escape-to-close. */
  active?: boolean;
  onClose: () => void;
  /** Navigate to a specific exhibit from within the panel */
  onNavigate?: (item: ExhibitItem) => void;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// ─── Image Placeholder ────────────────────────────────────────────────────────

function ImagePlaceholder({ color }: { color: string }) {
  return (
    <div
      className={styles.imagePlaceholder}
      style={{
        background: `linear-gradient(135deg, ${color}22 0%, ${color}44 50%, ${color}18 100%)`,
      }}
    >
      <svg
        className={styles.imagePlaceholderIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}

// ─── Nav Arrow ────────────────────────────────────────────────────────────────

function ArrowLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Museum artifact information panel — light glassmorphism edition.
 *
 * A floating panel that emerges on the right side of the screen.
 * Shows: category tag, title, image, accent line, pull quote, body description,
 * interesting facts, and prev/next navigation within the same category.
 *
 * Motion: calm, confident — like a museum placard gently settling into view.
 */
export default function InfoDrawer({ item, active = false, onClose, onNavigate }: InfoDrawerProps) {
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

  // Escape key closes drawer — but ONLY when this panel is the active
  // focus (showcasing state). While exploring, Escape belongs to pointer lock
  // release / settings open, handled by the parent.
  useEffect(() => {
    if (!open || !active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, active, onClose]);

  // Focus management
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

  const prevExhibit = displayItem ? getPrevExhibit(displayItem) : null;
  const nextExhibit = displayItem ? getNextExhibit(displayItem) : null;

  const handlePrev = () => {
    if (prevExhibit && onNavigate) onNavigate(prevExhibit);
  };

  const handleNext = () => {
    if (nextExhibit && onNavigate) onNavigate(nextExhibit);
  };

  return (
    <>
      {/* Scrim — barely-there veil */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`${styles.scrim} ${open ? styles.scrimOpen : ""}`}
      />

      {/* Floating panel */}
      <div className={styles.positioner}>
        <AnimatePresence>
          {open && displayItem && (
            <motion.aside
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={`${styles.panel} ${styles.panelOpen}`}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Image slot */}
              <div className={styles.imageSlot}>
                {displayItem.imageUrl ? (
                  <img
                    src={displayItem.imageUrl}
                    alt={displayItem.title}
                    className={styles.exhibitImage}
                    loading="lazy"
                  />
                ) : (
                  <ImagePlaceholder color={displayItem.color} />
                )}
              </div>

              {/* Content */}
              <div className={styles.innerSurface}>
                {/* Top row: category tag + close */}
                <div className={styles.topRow}>
                  <span className={styles.categoryLabel}>
                    {CATEGORY_LABEL[displayItem.category]}
                  </span>
                  <button
                    ref={closeBtnRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup panel"
                    className={styles.closeGlyph}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                {/* Title */}
                <h2 id={titleId} className={styles.title}>
                  {displayItem.title}
                </h2>

                {/* Accent hairline */}
                <div className={styles.accentLine} aria-hidden="true" />

                {/* Scrollable content */}
                <div className={styles.contentArea}>
                  {/* Pull quote */}
                  <p className={styles.pullQuote}>&ldquo;{displayItem.highlight}&rdquo;</p>

                  {/* Body */}
                  <p className={styles.bodyText}>{displayItem.description}</p>

                  {/* Facts */}
                  {displayItem.facts && displayItem.facts.length > 0 && (
                    <div className={styles.factsSection}>
                      <p className={styles.factsTitle}>Fakta Menarik</p>
                      <ul className={styles.factsList}>
                        {displayItem.facts.map((fact, i) => (
                          <li key={i} className={styles.factItem}>
                            <span className={styles.factDot} aria-hidden="true" />
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Navigation row */}
                <div className={styles.navRow}>
                  <button
                    type="button"
                    className={styles.navBtn}
                    onClick={handlePrev}
                    disabled={!prevExhibit}
                    aria-label="Pameran sebelumnya"
                  >
                    <ArrowLeft />
                    Sebelumnya
                  </button>

                  <button
                    type="button"
                    className={styles.navBtn}
                    onClick={handleNext}
                    disabled={!nextExhibit}
                    aria-label="Pameran berikutnya"
                  >
                    Berikutnya
                    <ArrowRight />
                  </button>

                  <span className={styles.navSpacer} />

                  <button
                    type="button"
                    onClick={onClose}
                    className={styles.actionText}
                    aria-label="Tutup panel dan kembali menjelajah"
                  >
                    Tutup
                    <span className={styles.actionArrow} aria-hidden="true">→</span>
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
