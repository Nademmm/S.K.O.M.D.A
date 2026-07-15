"use client";

import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import FirstPersonController from "@/components/FirstPersonController";
import InfoDrawer from "@/components/InfoDrawer";
import LandingOverlay from "@/components/LandingOverlay";
import CinematicCamera from "@/components/CinematicCamera";
import MuseumScene from "@/scenes/MuseumScene";
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
  const [selected, setSelected] = useState<ExhibitItem | null>(null);
  const [appState, setAppState] = useState<AppState>("idle");

  const handleEnter = useCallback(() => {
    setAppState("cinematic");
  }, []);

  const handleCinematicComplete = useCallback(() => {
    setAppState("ready-to-explore");
  }, []);

  const handleStartExploring = useCallback(() => {
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
        // Start camera exactly at the first cinematic waypoint to prevent teleports
        camera={{ fov: 75, near: 0.1, far: 100, position: [0, 12, 20] }}
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

        {/* Cinematic flythrough — always mounted until exploring to prevent jumps */}
        {appState !== "exploring" && (
          <CinematicCamera
            playing={appState === "cinematic"}
            onComplete={handleCinematicComplete}
          />
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
      {appState === "ready-to-explore" && (
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

      {/* Info drawer for clicked exhibits */}
      <InfoDrawer item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
