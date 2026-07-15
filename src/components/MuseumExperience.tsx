"use client";

import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import FirstPersonController from "@/components/FirstPersonController";
import InfoPopup from "@/components/InfoPopup";
import LandingOverlay from "@/components/LandingOverlay";
import CinematicCamera from "@/components/CinematicCamera";
import MuseumScene from "@/scenes/MuseumScene";
import type { ExhibitItem } from "@/utils/museumData";

type AppState = "idle" | "cinematic" | "exploring";

/**
 * Komponen utama pengalaman museum: membungkus Canvas Three.js,
 * mengelola state popup, dan menampilkan overlay UI (crosshair, instruksi).
 *
 * State machine:
 *   idle       → Landing page overlay visible, 3D scene renders in background
 *   cinematic  → Camera flythrough animation, overlay faded out
 *   exploring  → First-person controls active, pointer-lock engaged
 */
export default function MuseumExperience() {
  const [selected, setSelected] = useState<ExhibitItem | null>(null);
  const [appState, setAppState] = useState<AppState>("idle");

  const handleEnter = useCallback(() => {
    setAppState("cinematic");
  }, []);

  const handleCinematicComplete = useCallback(() => {
    setAppState("exploring");
  }, []);

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
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.6, 8] }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <color attach="background" args={["#0f172a"]} />
        <fog attach="fog" args={["#0f172a", 15, 45]} />
        <Suspense fallback={null}>
          <MuseumScene onSelectExhibit={setSelected} />
        </Suspense>

        {/* Cinematic flythrough — only during cinematic state */}
        {appState === "cinematic" && (
          <CinematicCamera onComplete={handleCinematicComplete} />
        )}

        {/* First-person controls — only active when exploring */}
        <FirstPersonController enabled={appState === "exploring"} />
      </Canvas>

      {/* Crosshair — only visible while exploring */}
      {appState === "exploring" && (
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 8,
            height: 8,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.8)",
            boxShadow: "0 0 6px rgba(255,255,255,0.3)",
          }}
        />
      )}

      {/* Cinematic vignette overlay during camera flythrough */}
      {appState === "cinematic" && (
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

      {/* Info popup for clicked exhibits */}
      {selected && (
        <InfoPopup item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
