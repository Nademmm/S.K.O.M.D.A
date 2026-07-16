"use client";

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { museumData, CATEGORY_LABEL, type ExhibitItem } from "@/utils/museumData";
import styles from "./HudShell.module.css";

interface HudShellProps {
  /** Currently selected / open exhibit (null = none) */
  selected: ExhibitItem | null;
  /** Set of exhibit IDs the player has already visited */
  visitedExhibits: Set<string>;
  /** Whether the player is currently pointing at an interactable object */
  isInteracting: boolean;
  /** Audio muted state */
  audioMuted: boolean;
  /** Toggle audio mute */
  onToggleAudio: () => void;
  /** Open settings panel */
  onOpenSettings: () => void;
}

// ─── Minimap ──────────────────────────────────────────────────────────────────

const MINIMAP_SIZE = 88;
const WORLD_SCALE = 3.6; // pixels per world unit
const WORLD_OFFSET_X = MINIMAP_SIZE / 2;
const WORLD_OFFSET_Z = MINIMAP_SIZE / 2;

function drawMinimap(
  ctx: CanvasRenderingContext2D,
  visited: Set<string>
) {
  ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

  // Clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, 0, Math.PI * 2);
  ctx.clip();

  // Background
  ctx.fillStyle = "rgba(238,238,238,0.55)";
  ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

  // Exhibits dots
  for (const exhibit of museumData) {
    const px = exhibit.position[0] * WORLD_SCALE + WORLD_OFFSET_X;
    const py = exhibit.position[2] * WORLD_SCALE + WORLD_OFFSET_Z;
    const isVisited = visited.has(exhibit.id);

    ctx.beginPath();
    ctx.arc(px, py, isVisited ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fillStyle = isVisited ? "#CB2957" : "rgba(0,0,0,0.25)";
    ctx.fill();

    if (isVisited) {
      ctx.beginPath();
      ctx.arc(px, py, 5.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(203,41,87,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Player marker — triangle pointing up
  const cx = MINIMAP_SIZE / 2;
  const cy = MINIMAP_SIZE / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 5.5);
  ctx.lineTo(cx - 3.5, cy + 3);
  ctx.lineTo(cx + 3.5, cy + 3);
  ctx.closePath();
  ctx.fillStyle = "#000";
  ctx.fill();

  ctx.restore();

  // Circle border
  ctx.beginPath();
  ctx.arc(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, MINIMAP_SIZE / 2 - 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.10)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19.4 13a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.08 15a1.7 1.7 0 0 0-1.56-1H2a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 3.6 8.5a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8 4.14V4a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.86 10H22a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function AudioOnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AudioOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ─── HUD Shell ────────────────────────────────────────────────────────────────

export default function HudShell({
  selected,
  visitedExhibits,
  isInteracting,
  audioMuted,
  onToggleAudio,
  onOpenSettings,
}: HudShellProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw minimap whenever visited set changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawMinimap(ctx, visitedExhibits);
  }, [visitedExhibits]);

  // Objective data derived from visited exhibits
  const { objectiveTitle, visitedCount, totalCount, completionPct } = useMemo(() => {
    const total = museumData.length;
    const visited = visitedExhibits.size;
    const pct = total > 0 ? Math.round((visited / total) * 100) : 0;

    // Find first unvisited category group
    const unvisited = museumData.find((e) => !visitedExhibits.has(e.id));
    const objective = unvisited
      ? `Jelajahi ${CATEGORY_LABEL[unvisited.category]}`
      : "Semua Pameran Selesai!";

    return {
      objectiveTitle: objective,
      visitedCount: visited,
      totalCount: total,
      completionPct: pct,
    };
  }, [visitedExhibits]);

  // Show interaction prompt only when pointing at object and no popup open
  const showPrompt = isInteracting && selected === null;

  return (
    <div className={styles.hud} aria-hidden="true">

      {/* ── TOP LEFT: Logo ──────────────────────────────────────────── */}
      <div className={`${styles.topLeft} ${styles.glassPill}`}>
        <div className={styles.logoMark}>
          <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.9" />
            <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
            <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.85" />
          </svg>
        </div>
        <div className={styles.logoText}>
          <span className={styles.logoName}>TelkomVerse</span>
          <span className={styles.logoSub}>SMK Telkom Sidoarjo</span>
        </div>
      </div>

      {/* ── TOP CENTER: Objective Banner ────────────────────────────── */}
      <div className={styles.topCenter}>
        <div className={`${styles.objectiveBanner} ${styles.glassPill}`}>
          <span className={styles.objectiveIcon} />
          <span className={styles.objectiveLabel}>Tujuan</span>
          <span className={styles.objectiveSep} />
          <span className={styles.objectiveTitle}>{objectiveTitle}</span>
          <span className={styles.objectiveSep} />
          <span className={styles.objectiveCount}>
            <strong>{visitedCount}</strong> / {totalCount}
          </span>
        </div>
      </div>

      {/* ── TOP RIGHT: Icon Cluster ──────────────────────────────────── */}
      <div className={styles.topRight}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onToggleAudio}
          aria-label={audioMuted ? "Aktifkan audio" : "Matikan audio"}
          title={audioMuted ? "Aktifkan Audio" : "Matikan Audio"}
        >
          {audioMuted ? <AudioOffIcon /> : <AudioOnIcon />}
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onOpenSettings}
          aria-label="Buka pengaturan"
          title="Pengaturan"
        >
          <SettingsIcon />
        </button>
      </div>

      {/* ── BOTTOM LEFT: Minimap ─────────────────────────────────────── */}
      <div className={styles.bottomLeft}>
        <div className={`${styles.minimapWrap} ${styles.glassPill}`}>
          <canvas
            ref={canvasRef}
            width={MINIMAP_SIZE}
            height={MINIMAP_SIZE}
            className={styles.minimapCanvas}
            aria-label="Minimap museum"
          />
        </div>
        <p className={styles.minimapLabel}>Peta Museum</p>
      </div>

      {/* ── BOTTOM CENTER: Interaction Prompt ───────────────────────── */}
      <div className={styles.bottomCenter}>
        <AnimatePresence>
          {showPrompt && (
            <motion.div
              className={`${styles.interactPrompt} ${styles.glassPill}`}
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className={styles.keycap}>E</span>
              <span className={styles.promptText}>untuk Berinteraksi</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM RIGHT: Completion ─────────────────────────────────── */}
      <div className={`${styles.bottomRight} ${styles.glassPill}`}>
        <div className={styles.completionHeader}>
          <span className={styles.completionLabel}>Selesai</span>
          <span className={styles.completionPercent}>
            {completionPct}<span>%</span>
          </span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className={styles.completionCount}>
          {visitedCount} dari {totalCount} pameran
        </p>
      </div>

      {/* ── CENTER: Crosshair ────────────────────────────────────────── */}
      {selected === null && (
        <div className={styles.crosshairWrap}>
          <div className={`${styles.crosshair} ${isInteracting ? styles.interacting : ""}`}>
            <span className={styles.crosshairSeg} />
            <span className={styles.crosshairSeg} />
            <span className={styles.crosshairSeg} />
            <span className={styles.crosshairSeg} />
            {isInteracting && <span className={styles.crosshairRing} />}
          </div>
        </div>
      )}

    </div>
  );
}
