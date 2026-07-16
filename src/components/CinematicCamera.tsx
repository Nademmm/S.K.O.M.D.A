"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CinematicCameraProps {
  /** If true, the camera dollies forward. If false, it holds the start position outside. */
  playing: boolean;
  /** Called once the dolly finishes. */
  onComplete: () => void;
}

const START_POS = new THREE.Vector3(0, 1.6, 12.5);
const END_POS = new THREE.Vector3(0, 1.6, 8.0);
const TARGET = new THREE.Vector3(0, 1.6, 0);
const DOLLY_DURATION = 0.85; // 850ms, within the 700-1000ms target

/**
 * CinematicCamera handles the entry camera transitions:
 * - While idle, it holds the camera outside the museum entrance.
 * - When playing is triggered, it dollies the camera forward to the first-person spawn point.
 */
export default function CinematicCamera({ playing, onComplete }: CinematicCameraProps) {
  const { camera } = useThree();
  const elapsed = useRef(0);
  const done = useRef(false);

  // Hold at start position when not playing
  useEffect(() => {
    if (!playing && !done.current) {
      camera.position.copy(START_POS);
      camera.lookAt(TARGET);
    }
  }, [playing, camera]);

  useFrame((_, delta) => {
    if (!playing || done.current) return;

    elapsed.current += delta;
    const progress = Math.min(elapsed.current / DOLLY_DURATION, 1);
    
    // Smooth ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);

    camera.position.lerpVectors(START_POS, END_POS, eased);
    camera.lookAt(TARGET);

    if (progress >= 1) {
      done.current = true;
      onComplete();
    }
  });

  return null;
}
