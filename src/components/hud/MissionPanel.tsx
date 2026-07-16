"use client";

import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORY_LABEL, museumData, type ExhibitCategory } from "@/utils/museumData";
import styles from "./MissionPanel.module.css";

// ─── Mission data model ───────────────────────────────────────────────────────

interface Mission {
  id: string;
  category: ExhibitCategory;
  name: string;
  total: number;
  xp: number;
}

// Derive missions from exhibit categories (each category = one mission)
const MISSIONS: Mission[] = (
  Object.keys(CATEGORY_LABEL) as ExhibitCategory[]
)
  .filter((cat) => museumData.some((e) => e.category === cat))
  .map((cat) => ({
    id: cat,
    category: cat,
    name: `Jelajahi semua pameran ${CATEGORY_LABEL[cat]}`,
    total: museumData.filter((e) => e.category === cat).length,
    xp: museumData.filter((e) => e.category === cat).length * 50,
  }));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <polyline
        points="2 5 4.5 7.5 8.5 2.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MissionPanelProps {
  visitedExhibits: Set<string>;
  /** Controlled open state (toggled externally via M key) */
  open: boolean;
  onToggle: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MissionPanel({ visitedExhibits, open, onToggle }: MissionPanelProps) {

  const isMissionDone = useCallback(
    (mission: Mission) => {
      return museumData
        .filter((e) => e.category === mission.category)
        .every((e) => visitedExhibits.has(e.id));
    },
    [visitedExhibits]
  );

  const pending = MISSIONS.filter((m) => !isMissionDone(m));
  const done    = MISSIONS.filter((m) => isMissionDone(m));
  const pct     = MISSIONS.length > 0 ? Math.round((done.length / MISSIONS.length) * 100) : 0;

  return (
    <div className={styles.container} aria-label="Panel Misi Museum">
      <AnimatePresence mode="wait">
        {open ? (
          /* ── Expanded Panel ─────────────────────────────────────── */
          <motion.div
            key="panel"
            className={styles.panel}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Misi Museum</span>
              <button
                type="button"
                className={styles.panelClose}
                onClick={onToggle}
                aria-label="Tutup panel misi"
              >
                ×
              </button>
            </div>

            <div className={styles.panelBody}>
              {/* Active missions */}
              {pending.length > 0 && (
                <>
                  <span className={styles.sectionLabel}>Sedang Berlangsung</span>
                  {pending.map((mission) => (
                    <div key={mission.id} className={styles.missionRow}>
                      <div className={`${styles.missionCheck}`}>
                        <CheckIcon />
                      </div>
                      <div className={styles.missionText}>
                        <span className={styles.missionName}>{mission.name}</span>
                      </div>
                      <span className={styles.missionXp}>+{mission.xp} XP</span>
                    </div>
                  ))}
                </>
              )}

              {/* Completed missions */}
              {done.length > 0 && (
                <>
                  <span className={styles.sectionLabel} style={{ marginTop: 8 }}>
                    Selesai
                  </span>
                  {done.map((mission) => (
                    <div key={mission.id} className={`${styles.missionRow} ${styles.completed}`}>
                      <div className={`${styles.missionCheck} ${styles.done}`}>
                        <CheckIcon />
                      </div>
                      <div className={styles.missionText}>
                        <span className={styles.missionName}>{mission.name}</span>
                      </div>
                      <span className={styles.missionXp}>+{mission.xp} XP</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className={styles.panelFooter}>
              <div className={styles.footerLabel}>
                <span>Kemajuan Misi</span>
                <span><strong>{done.length}</strong> / {MISSIONS.length}</span>
              </div>
              <div className={styles.footerTrack}>
                <div className={styles.footerFill} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Collapsed Tab ──────────────────────────────────────── */
          <motion.button
            key="tab"
            type="button"
            className={styles.tab}
            onClick={onToggle}
            aria-label="Buka panel misi (M)"
            aria-expanded={false}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.tabDot} />
            <span className={styles.tabLabel}>Misi</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
