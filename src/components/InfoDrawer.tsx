"use client";

import { useEffect, useRef, useState } from "react";
import {
  CATEGORY_LABEL,
  type ExhibitIcon,
  type ExhibitItem,
} from "@/utils/museumData";
import styles from "./InfoDrawer.module.css";

interface InfoDrawerProps {
  /** Item yang dipilih; null berarti popup tertutup */
  item: ExhibitItem | null;
  onClose: () => void;
}

/** Emoji sederhana sebagai ikon kategori di header popup (tanpa asset) */
const ICON_GLYPH: Record<ExhibitIcon, string> = {
  clock: "⏰",
  uniform: "👔",
  class: "📚",
  broom: "🧹",
  shield: "🛡️",
  greeting: "🤝",
  hands: "🤲",
  trophy: "🏆",
  flag: "🚩",
  culture: "🏛️",
};

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Panel informasi mengambang dengan estetika liquid glass.
 * Kartu translusen di kanan tengah layar — museum tetap terlihat di belakang
 * sambil menjaga keterbacaan teks. Konten dipertahankan selama animasi tutup.
 */
export default function InfoDrawer({ item, onClose }: InfoDrawerProps) {
  const open = item !== null;
  const [displayItem, setDisplayItem] = useState<ExhibitItem | null>(item);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = "info-popup-title";

  useEffect(() => {
    if (item) {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setDisplayItem(item);
    } else {
      closeTimer.current = setTimeout(() => setDisplayItem(null), 300);
    }
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [item]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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

  const accent = displayItem?.color ?? "#22d3ee";

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`${styles.scrim} ${open ? styles.scrimOpen : ""}`}
      />

      <div className={styles.positioner}>
        <aside
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={displayItem ? titleId : undefined}
          aria-hidden={!open}
          className={`${styles.card} ${open ? styles.cardOpen : ""}`}
          style={{ "--accent": accent } as React.CSSProperties}
        >
          {displayItem && (
            <>
              <header className={styles.header}>
                <div className={styles.headerTop}>
                  <span className={styles.badge}>
                    {CATEGORY_LABEL[displayItem.category]}
                  </span>
                  <button
                    ref={closeBtnRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup"
                    className={styles.closeBtn}
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.headerMain}>
                  <div className={styles.iconContainer} aria-hidden="true">
                    {ICON_GLYPH[displayItem.icon]}
                  </div>
                  <h2 id={titleId} className={styles.title}>
                    {displayItem.title}
                  </h2>
                </div>
              </header>

              <div className={styles.content}>
                <div className={styles.textSurface}>
                  <div className={styles.quote}>
                    <p className={styles.quoteText}>
                      &ldquo;{displayItem.highlight}&rdquo;
                    </p>
                  </div>

                  <p className={styles.bodyText}>{displayItem.description}</p>
                </div>
              </div>

              <footer className={styles.footer}>
                <button
                  type="button"
                  onClick={onClose}
                  className={styles.primaryBtn}
                >
                  Kembali Menjelajah
                </button>
              </footer>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
