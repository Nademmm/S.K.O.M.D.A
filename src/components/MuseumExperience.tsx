"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import FirstPersonController from "@/components/FirstPersonController";
import InfoPopup from "@/components/InfoPopup";
import MuseumScene from "@/scenes/MuseumScene";
import type { ExhibitItem } from "@/utils/museumData";

/**
 * Komponen utama pengalaman museum: membungkus Canvas Three.js,
 * mengelola state popup, dan menampilkan overlay UI (crosshair, instruksi).
 */
export default function MuseumExperience() {
  const [selected, setSelected] = useState<ExhibitItem | null>(null);
  const [started, setStarted] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.6, 8] }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <color attach="background" args={["#0f172a"]} />
        <fog attach="fog" args={["#0f172a", 15, 45]} />
        <Suspense fallback={null}>
          <MuseumScene onSelectExhibit={setSelected} />
        </Suspense>
        <FirstPersonController />
      </Canvas>

      {/* Crosshair */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow" />

      {/* Overlay instruksi awal */}
      {!started && (
        <div
          className="absolute inset-0 z-40 flex cursor-pointer flex-col items-center justify-center gap-4 bg-black/70 text-center text-white"
          onClick={() => setStarted(true)}
        >
          <h1 className="text-3xl font-bold">SKOMDA Virtual Museum</h1>
          <p className="max-w-md text-sm text-zinc-300">
            Klik untuk masuk &amp; mengunci kursor. Gunakan{" "}
            <span className="font-semibold">WASD / Arrow Keys</span> untuk
            berjalan, gerakkan mouse untuk menoleh, dan klik objek untuk
            melihat informasinya.
          </p>
          <span className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium">
            Mulai Menjelajah
          </span>
        </div>
      )}

      {selected && (
        <InfoPopup item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
