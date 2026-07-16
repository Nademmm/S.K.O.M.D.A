"use client";

import { Suspense, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette, N8AO } from "@react-three/postprocessing";
import FirstPersonController, {
  type CameraSettings,
} from "@/components/FirstPersonController";
import InfoDrawer from "@/components/InfoDrawer";
import LandingOverlay from "@/components/LandingOverlay";
import CinematicCamera from "@/components/CinematicCamera";
import { ambientAudio } from "@/utils/audioSynth";
import MuseumScene from "@/scenes/MuseumScene";
import { useSettings } from "@/settings/SettingsContext";
import SettingsPanel from "@/components/settings/SettingsPanel";
import FpsCounter from "@/components/settings/FpsCounter";
import AccessibilityEffects from "@/components/settings/AccessibilityEffects";

// New HUD system
import HudShell from "@/components/hud/HudShell";
import AchievementToast from "@/components/hud/AchievementToast";
import MissionPanel from "@/components/hud/MissionPanel";

import type { ExhibitItem } from "@/utils/museumData";
import { museumData } from "@/utils/museumData";
import InteractionManager from "@/interaction/InteractionManager";
import DebugOverlay from "@/components/DebugOverlay";
import DebugHelper3D from "@/components/DebugHelper3D";

type AppState = "idle" | "cinematic" | "ready-to-explore" | "exploring" | "showcasing";

// ─── Achievement milestones ────────────────────────────────────────────────────

interface Achievement {
  threshold: number; // % completion
  label: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { threshold: 25,  label: "Penjelajah Pemula" },
  { threshold: 50,  label: "Setengah Jalan!" },
  { threshold: 75,  label: "Hampir Selesai" },
  { threshold: 100, label: "Penjelajah Museum Sejati" },
];

/**
 * Komponen utama pengalaman museum: membungkus Canvas Three.js,
 * mengelola state popup, dan menampilkan overlay UI (HudShell, AchievementToast, MissionPanel).
 *
 * State machine:
 *   idle             → Landing page overlay visible, camera at start position
 *   cinematic        → Camera flythrough animation, overlay faded out
 *   ready-to-explore → Flythrough done, showing prompt to click and lock pointer
 *   exploring        → First-person controls active, pointer-lock engaged
 */
export default function MuseumExperience() {
  const { settings } = useSettings();
  const [selected, setSelected]     = useState<ExhibitItem | null>(null);
  const [appState, setAppState]     = useState<AppState>("idle");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ── HUD state ───────────────────────────────────────────────────────────────

  const [visitedExhibits, setVisitedExhibits] = useState<Set<string>>(new Set());
  const [isInteracting, setIsInteracting]     = useState(false);
  const [audioMuted, setAudioMuted]           = useState(false);
  const [missionOpen, setMissionOpen]         = useState(false);

  // Achievement toast
  const [toastVisible, setToastVisible]       = useState(false);
  const [toastLabel, setToastLabel]           = useState("");
  const unlockedThresholds = useRef<Set<number>>(new Set());

  // ── Interaction state ───────────────────────────────────────────────────────

  /**
   * Set to `true` immediately before calling `document.exitPointerLock()` from code
   * (e.g., when opening an exhibit panel). Prevents `handlePointerLockLost` from
   * treating the programmatic unlock as an accidental Esc press and opening Settings.
   * Reset to `false` inside `handlePointerLockLost` after checking.
   */
  const intentionalLockRelease = useRef(false);

  // ── State machine handlers ─────────────────────────────────────────────────

  const handleEnter = useCallback(() => {
    setAppState("cinematic");
    ambientAudio.start();
    ambientAudio.setMute(audioMuted);
  }, [audioMuted]);

  const handleCinematicComplete = useCallback(() => {
    setAppState("exploring");
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.requestPointerLock();
    }
  }, []);
  
  const handleStartExploring    = useCallback(() => {
    setAppState("exploring");
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.requestPointerLock();
    }
  }, []);

  // Membuka Settings → jeda kontrol first-person & lepas pointer lock.
  const openSettings  = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    setAppState((s) => (s === "exploring" ? "ready-to-explore" : s));
  }, []);

  // Pointer lock lost while exploring — just release, do NOT open settings.
  // Settings are now opened with the O key instead.
  const handlePointerLockLost = useCallback(() => {
    if (intentionalLockRelease.current) {
      intentionalLockRelease.current = false; // consume the flag
      return;
    }
    // Simply transition back to ready-to-explore (pointer lock released)
    setAppState((s) => (s === "exploring" ? "ready-to-explore" : s));
  }, []);

  const handleSelectExhibit = useCallback((item: ExhibitItem | null) => {
    setSelected(item);
    if (item) {
      // Signal that this pointer lock release is intentional before calling exitPointerLock.
      // This prevents handlePointerLockLost from treating it as an Esc press → Settings open.
      intentionalLockRelease.current = true;
      if (document.pointerLockElement) {
        document.exitPointerLock();
      } else {
        // Lock was already released; reset flag immediately
        intentionalLockRelease.current = false;
      }
      setAppState("showcasing");

      setVisitedExhibits((prev) => {
        if (prev.has(item.id)) return prev;
        const next = new Set(prev);
        next.add(item.id);

        // Check achievements directly upon new visit
        const total = museumData.length;
        const visited = next.size;
        if (total > 0) {
          const pct = (visited / total) * 100;
          for (const achievement of ACHIEVEMENTS) {
            if (pct >= achievement.threshold && !unlockedThresholds.current.has(achievement.threshold)) {
              unlockedThresholds.current.add(achievement.threshold);
              setToastLabel(achievement.label);
              setToastVisible(true);
              break;
            }
          }
        }

        return next;
      });
    }
  }, []);

  // Close InfoDrawer → route directly back to exploring and re-engage pointer lock automatically.
  const handleInfoClose = useCallback(() => {
    setSelected(null);
    setAppState((s) => (s === "showcasing" ? "exploring" : s));
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.requestPointerLock();
    }
  }, []);

  // ── O key — open Settings panel ─────────────────────────────────────────

  useEffect(() => {
    if (appState !== "exploring" && appState !== "ready-to-explore") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "o" || e.key === "O") {
        e.preventDefault();
        openSettings();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [appState, openSettings]);

  // ── M key — toggle mission panel ─────────────────────────────────────────

  useEffect(() => {
    if (appState !== "exploring") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "m" || e.key === "M") {
        setMissionOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [appState]);

  // Sync synthesized ambient audio with user mute controls
  useEffect(() => {
    ambientAudio.setMute(audioMuted);
  }, [audioMuted]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      ambientAudio.stop();
    };
  }, []);

  // ── Camera settings memo ──────────────────────────────────────────────────

  const cameraSettings = useMemo<CameraSettings>(
    () => ({
      mouseSensitivity: settings.mouseSensitivity,
      cameraSmoothness: settings.cameraSmoothness,
      cameraFov:        settings.cameraFov,
      invertYAxis:      settings.invertYAxis,
      mouseAcceleration: settings.mouseAcceleration,
      cameraShake:      settings.cameraShake,
      walkingSpeed:     settings.walkingSpeed,
      runningSpeed:     settings.runningSpeed,
      headBobbing:      settings.headBobbing,
      reduceMotion:     settings.reduceMotion,
    }),
    [settings]
  );

  const exploring         = appState === "exploring";
  const showcasing        = appState === "showcasing";
  // Movement is frozen during showcase — player is reading the panel
  const controllerEnabled = exploring && !settingsOpen;

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* Efek accessibility global */}
      <AccessibilityEffects />

      <Canvas
        shadows
        camera={{ fov: settings.cameraFov, near: 0.1, far: 100, position: [0, 12, 20] }}
        gl={{
          antialias: settings.antiAliasing,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
        style={{ pointerEvents: "auto" }}
      >
        <color attach="background" args={["#f2f0ec"]} />
        <fog attach="fog" args={["#f2f0ec", 20, 55]} />
        
        <EffectComposer multisampling={8}>
          <N8AO distanceFalloff={1} aoRadius={1.2} intensity={2.2} />
          <Bloom luminanceThreshold={0.9} mipmapBlur intensity={0.6} />
          <Vignette eskil={false} offset={0.15} darkness={0.72} />
        </EffectComposer>

        <Suspense fallback={null}>
          <MuseumScene />
        </Suspense>

        {/*
         * CinematicCamera: only mounted during idle / cinematic / ready-to-explore.
         * CRITICAL: must NOT be mounted during "showcasing" or "exploring".
         * If mounted during "showcasing", component remounts (done.current resets to false)
         * and its useEffect forcibly moves the camera back to waypoint[0] = (0, 12, 20),
         * which is the camera composition break visible in the info panel screenshot.
         */}
        {(appState === "idle" || appState === "cinematic" || appState === "ready-to-explore") && (
          <CinematicCamera
            playing={appState === "cinematic"}
            onComplete={handleCinematicComplete}
          />
        )}

        {/* First-person controls */}
        <FirstPersonController
          enabled={controllerEnabled}
          settings={cameraSettings}
          onPointerLockLost={handlePointerLockLost}
        />

        {/* Centralized interaction: single raycaster → registered colliders only */}
        <InteractionManager
          enabled={controllerEnabled}
          onInteract={handleSelectExhibit}
          onHoverChange={setIsInteracting}
        />

        {/* 3D Debug Visualizers (Laser vector + boundary rings) */}
        <DebugHelper3D />
      </Canvas>

      {/* FPS counter */}
      {settings.showFps && appState !== "idle" && <FpsCounter />}

      {/* Cinematic vignette overlay */}
      {(appState === "cinematic" || appState === "ready-to-explore") && (
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
            zIndex: 30,
          }}
        />
      )}

      {/* Landing overlay */}
      {appState === "idle" && <LandingOverlay onEnter={handleEnter} />}


      {/* When pointer lock is released (ESC), just show a subtle click-to-resume hint
          with NO blur/darkening — the museum stays fully visible and interactive */}
      {appState === "ready-to-explore" && !settingsOpen && (
        <div
          onClick={handleStartExploring}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 40,
            cursor: "pointer",
          }}
        />
      )}

      {/* ── HUD Shell — visible while exploring OR cursor-free (ready-to-explore) */}
      {(exploring || appState === "ready-to-explore") && !settingsOpen && (
        <HudShell
          selected={selected}
          visitedExhibits={visitedExhibits}
          isInteracting={isInteracting}
          audioMuted={audioMuted}
          onToggleAudio={() => setAudioMuted((m) => !m)}
          onOpenSettings={openSettings}
        />
      )}

      {/* ── Mission Panel ─────────────────────────────────────────────── */}
      {exploring && !settingsOpen && (
        <MissionPanel
          visitedExhibits={visitedExhibits}
          open={missionOpen}
          onToggle={() => setMissionOpen((o) => !o)}
        />
      )}

      {/* ── Achievement Toast ─────────────────────────────────────────── */}
      <AchievementToast
        visible={toastVisible}
        label={toastLabel}
        duration={4000}
        onDismiss={() => setToastVisible(false)}
      />

      {/* ── Floating info popup for clicked exhibits ──────────────────── */}
      <InfoDrawer
        item={selected}
        active={showcasing}
        onClose={handleInfoClose}
        onNavigate={handleSelectExhibit}
      />

      {/* ── Settings panel (pause menu) ───────────────────────────────── */}
      <SettingsPanel open={settingsOpen} onClose={closeSettings} />

      {/* ── Debug HUD (toggled via F3 / tilde) ─────────────────────────── */}
      <DebugOverlay appState={appState} settingsOpen={settingsOpen} />
    </div>
  );
}
