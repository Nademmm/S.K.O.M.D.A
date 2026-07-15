"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { museumData } from "@/utils/museumData";

const MOVE_SPEED = 5; // meter per detik
const ROOM_HALF_WIDTH = 11; // batas collision sumbu X
const ROOM_HALF_DEPTH = 13; // batas collision sumbu Z
const PLAYER_RADIUS = 0.5;
const EYE_HEIGHT = 1.6;
// Radius dasar pedestal (0.55) + sedikit margin keamanan
const PILLAR_RADIUS = 0.55 + PLAYER_RADIUS;

// Ekstrak posisi X dan Z semua pilar sekali saja (tidak berubah saat runtime)
const PILLAR_POSITIONS = museumData.map((item) => ({
  x: item.position[0],
  z: item.position[2],
}));

interface FirstPersonControllerProps {
  /** When false, movement is frozen and Pointer Lock is not rendered. */
  enabled?: boolean;
}

/**
 * Kontrol first-person: WASD/arrow untuk bergerak, mouse (Pointer Lock) untuk
 * menoleh, dengan collision sederhana berupa batas kotak ruangan museum dan
 * collision lingkaran untuk setiap pilar informasi.
 */
export default function FirstPersonController({
  enabled = true,
}: FirstPersonControllerProps) {
  const { camera } = useThree();
  const keys = useKeyboardControls();
  const direction = useRef(new THREE.Vector3());
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!enabled) return;

    const { forward, backward, left, right } = keys.current;

    camera.getWorldDirection(frontVector.current);
    frontVector.current.y = 0;
    frontVector.current.normalize();

    sideVector.current.crossVectors(frontVector.current, camera.up).normalize();

    const forwardAmount = Number(forward) - Number(backward);
    const rightAmount = Number(right) - Number(left);

    direction.current.set(0, 0, 0);
    if (forwardAmount !== 0 || rightAmount !== 0) {
      direction.current
        .addScaledVector(frontVector.current, forwardAmount)
        .addScaledVector(sideVector.current, rightAmount)
        .normalize()
        .multiplyScalar(MOVE_SPEED * delta);
    }

    // Hitung posisi kandidat berikutnya setelah bergerak
    let nextX = camera.position.x + direction.current.x;
    let nextZ = camera.position.z + direction.current.z;

    // Collision batas ruangan: clamp posisi kamera di dalam batas kotak.
    nextX = THREE.MathUtils.clamp(
      nextX,
      -ROOM_HALF_WIDTH + PLAYER_RADIUS,
      ROOM_HALF_WIDTH - PLAYER_RADIUS
    );
    nextZ = THREE.MathUtils.clamp(
      nextZ,
      -ROOM_HALF_DEPTH + PLAYER_RADIUS,
      ROOM_HALF_DEPTH - PLAYER_RADIUS
    );

    // Collision pilar: dorong pemain keluar dari setiap pilar (circle collision)
    for (const pillar of PILLAR_POSITIONS) {
      const dx = nextX - pillar.x;
      const dz = nextZ - pillar.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < PILLAR_RADIUS * PILLAR_RADIUS && distSq > 0) {
        // Normalkan vektor dari pilar ke pemain lalu dorong ke luar
        const dist = Math.sqrt(distSq);
        const push = PILLAR_RADIUS / dist;
        nextX = pillar.x + dx * push;
        nextZ = pillar.z + dz * push;
      }
    }

    camera.position.set(nextX, EYE_HEIGHT, nextZ);
  });

  // Only mount PointerLockControls when enabled — this prevents premature
  // pointer-lock requests during the cinematic sequence.
  if (!enabled) return null;

  return <PointerLockControls />;
}
