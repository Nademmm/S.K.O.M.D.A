"use client";

import { Suspense, useState, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import FirstPersonController, {
  type CameraSettings,
} from "@/components/FirstPersonController";
import InfoDrawer from "@/components/InfoDrawer";
import LandingOverlay from "@/components/LandingOverlay";
import CinematicCamera from "@/components/CinematicCamera";
import MuseumScene from "@/scenes/MuseumScene";
import { useSettings } from "@/settings/SettingsContext";
import SettingsPanel from "@/components/settings/SettingsPanel";
import SettingsButton from "@/components/settings/SettingsButton";
import Crosshair from "@/components/settings/Crosshair";
import FpsCounter from "@/components/settings/FpsCounter";
import AccessibilityEffects from "@/components/settings/AccessibilityEffects";
import type { ExhibitItem } from "@/utils/museumData";

type AppState = "idle" | "cinematic" | "ready-to-explore" | "exploring";

/**
 * Komponen utama pengalaman museum: membungkus Canvas Three.js,
 * mengelola state popup, dan menampilkan overlay UI (crosshair, instruksi).
 *
 * State machine:
 *   idle             → Landing page overlay visible, camera at start position
 *   cinematic        → Camera flythrough animation, overlay faded out
 *   ready-to-explore → Flythrough done, showing prompt to click and lock pointer
 *   exploring        → First-person controls active, pointer-lock engaged
 */
export default function MuseumExperience() {
  const { settings } = useSettings();
  const [selected, setSelected] = useState<ExhibitItem | null>(null);
  const [appState, setAppState] = useState<AppState>("idle");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleEnter = useCallback(() => setAppState("cinematic"), []);
  const handleCinematicComplete = useCallback(
    () => setAppState("ready-to-explore"),
    []
  );
  const handleStartExploring = useCallback(() => setAppState("exploring"), []);

  // Membuka Settings → jeda kontrol first-person & lepas pointer lock.
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    // Kembali ke prompt agar pengguna klik untuk mengunci pointer lagi.
    setAppState((s) => (s === "exploring" ? "ready-to-explore" : s));
  }, []);

  // Pointer lock hilang selagi menjelajah (mis. tekan Esc) → buka Settings (pause).
  const handlePointerLockLost = useCallback(() => {
    setSettingsOpen((open) => {
      if (!open) return true;
      return open;
    });
  }, []);

  // Subset pengaturan yang relevan untuk kamera — diteruskan sebagai props
  // karena React Context tidak menembus boundary reconciler <Canvas>.
  const cameraSettings = useMemo<CameraSettings>(
    () => ({
      mouseSensitivity: settings.mouseSensitivity,
      cameraSmoothness: settings.cameraSmoothness,
      cameraFov: settings.cameraFov,
      invertYAxis: settings.invertYAxis,
      mouseAcceleration: settings.mouseAcceleration,
      cameraShake: settings.cameraShake,
      walkingSpeed: settings.walkingSpeed,
      runningSpeed: settings.runningSpeed,
      headBobbing: settings.headBobbing,
      reduceMotion: settings.reduceMotion,
    }),
    [settings]
  );

  const exploring = appState === "exploring";
  const controllerEnabled = exploring && !settingsOpen;
  const showCrosshair =
    !settingsOpen &&
    (controllerEnabled || (settings.alwaysCrosshair && appState !== "idle"));

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
      {/* Efek accessibility global (high contrast, large text, color blind, dsb.) */}
      <AccessibilityEffects />

      <Canvas
        shadows
        // Start camera exactly at the first cinematic waypoint to prevent teleports
        camera={{ fov: settings.cameraFov, near: 0.1, far: 100, position: [0, 12, 20] }}
        gl={{
          antialias: settings.antiAliasing,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <color attach="background" args={["#0f172a"]} />
        <fog attach="fog" args={["#0f172a", 15, 45]} />
        <Suspense fallback={null}>
          <MuseumScene onSelectExhibit={setSelected} />
        </Suspense>

        {/* Cinematic flythrough — always mounted until exploring to prevent jumps */}
        {appState !== "exploring" && (
          <CinematicCamera
            playing={appState === "cinematic"}
            onComplete={handleCinematicComplete}
          />
        )}

        {/* First-person controls — active only when exploring & settings closed */}
        <FirstPersonController
          enabled={controllerEnabled}
          settings={cameraSettings}
          onPointerLockLost={handlePointerLockLost}
        />
      </Canvas>

      {/* Crosshair — style & visibility dikendalikan pengaturan */}
      {showCrosshair && (
        <Crosshair
          style={settings.crosshairStyle}
          color={settings.highContrast ? "#ffffff" : "rgba(255,255,255,0.85)"}
        />
      )}

      {/* FPS counter */}
      {settings.showFps && appState !== "idle" && <FpsCounter />}

      {/* Tombol pengaturan (gear) — tampil setelah landing */}
      {appState !== "idle" && !settingsOpen && (
        <SettingsButton onClick={openSettings} />
      )}

      {/* Cinematic vignette overlay during camera flythrough */}
      {(appState === "cinematic" || appState === "ready-to-explore") && (
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
            zIndex: 30,
          }}
        />
      )}

      {/* Landing overlay — visible only in idle state */}
      {appState === "idle" && <LandingOverlay onEnter={handleEnter} />}

      {/* Prompt to click and engage pointer lock after cinematic */}
      {appState === "ready-to-explore" && !settingsOpen && (
        <div
          onClick={handleStartExploring}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(10, 10, 11, 0.55)",
            cursor: "pointer",
            animation: "readyFadeIn 0.7s cubic-bezier(0.25,0.1,0.25,1) forwards",
          }}
          role="button"
          aria-label="Click to begin exploration"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              textAlign: "center",
            }}
          >
            {/* Thin accent line */}
            <div
              style={{
                width: "36px",
                height: "1px",
                background: "rgba(197, 168, 128, 0.4)",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-sans, system-ui, sans-serif)",
                fontSize: "0.7rem",
                fontWeight: 300,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(228, 220, 210, 0.45)",
                margin: 0,
              }}
            >
              Click anywhere to continue
            </p>
            <p
              style={{
                fontFamily: "var(--font-serif, Georgia, serif)",
                fontSize: "1.1rem",
                fontWeight: 300,
                letterSpacing: "-0.01em",
                color: "rgba(228, 220, 210, 0.75)",
                margin: 0,
                fontStyle: "italic",
              }}
            >
              The museum awaits
            </p>
            <div
              style={{
                width: "36px",
                height: "1px",
                background: "rgba(197, 168, 128, 0.4)",
              }}
            />
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes readyFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}} />
        </div>
      )}

      {/* Floating info popup for clicked exhibits */}
      <InfoDrawer item={selected} onClose={() => setSelected(null)} />

      {/* Settings panel (pause menu) */}
      <SettingsPanel open={settingsOpen} onClose={closeSettings} />
    </div>
  );
}
