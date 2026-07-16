"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./AchievementToast.module.css";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AchievementToastProps {
  /** Whether the toast is currently visible */
  visible: boolean;
  /** Achievement name to display, e.g. "Culture Explorer" */
  label: string;
  /** Auto-dismiss duration in ms (default: 3500) */
  duration?: number;
  /** Callback when the auto-dismiss timer expires */
  onDismiss: () => void;
}

// ─── Icon ─────────────────────────────────────────────────────────────────────

function TrophyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="8 21 12 17 16 21" />
      <path d="M12 17V13" />
      <path d="M7 4h10l1 7a6 6 0 0 1-12 0L7 4Z" />
      <path d="M5 4H3a1 1 0 0 0-1 1v3a3 3 0 0 0 3 3h.5" />
      <path d="M19 4h2a1 1 0 0 1 1 1v3a3 3 0 0 1-3 3h-.5" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AchievementToast({
  visible,
  label,
  duration = 3500,
  onDismiss,
}: AchievementToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onDismiss, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, duration, onDismiss]);

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <AnimatePresence>
        {visible && (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, x: 48, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.iconWrap}>
              <TrophyIcon />
            </div>
            <div className={styles.text}>
              <span className={styles.tag}>Pencapaian Terbuka</span>
              <span className={styles.label}>{label}</span>
            </div>
            <div className={styles.timer}>
              <div
                className={styles.timerFill}
                style={{ "--toast-duration": `${duration}ms` } as React.CSSProperties}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
