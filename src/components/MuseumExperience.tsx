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
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            cursor: "pointer",
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              padding: "1rem 2rem",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "1rem",
              textAlign: "center",
              animation: "fadeIn 0.5s ease",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem 0", fontWeight: 600 }}>
              Siap Menjelajah
            </h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
              Klik layar untuk mulai dan mengunci kursor
            </p>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
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
