"use client";

import { useRef, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CinematicCameraProps {
  /** Called once the flythrough finishes. */
  onComplete: () => void;
}

/** Total duration of the cinematic sweep in seconds. */
const DURATION = 4.5;

/**
 * Waypoints the camera flies through.
 * Each entry: { position: [x,y,z], lookAt: [x,y,z], t: normalised time 0‥1 }
 */
const WAYPOINTS: { pos: THREE.Vector3; lookAt: THREE.Vector3; t: number }[] = [
  {
    pos: new THREE.Vector3(0, 12, 20),
    lookAt: new THREE.Vector3(0, 2, 0),
    t: 0,
  },
  {
    pos: new THREE.Vector3(10, 8, 10),
    lookAt: new THREE.Vector3(0, 1, 0),
    t: 0.25,
  },
  {
    pos: new THREE.Vector3(8, 5, -2),
    lookAt: new THREE.Vector3(0, 2, -4),
    t: 0.5,
  },
  {
    pos: new THREE.Vector3(2, 3, 2),
    lookAt: new THREE.Vector3(0, 1.6, -3),
    t: 0.75,
  },
  {
    // Final position = first-person spawn point
    pos: new THREE.Vector3(0, 1.6, 8),
    lookAt: new THREE.Vector3(0, 1.6, 0),
    t: 1,
  },
];

/**
 * Smooth-step easing (ease-in-out cubic).
 */
function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Find the two surrounding waypoints for a given normalised time,
 * then interpolate position and lookAt.
 */
function samplePath(
  normTime: number,
  outPos: THREE.Vector3,
  outLook: THREE.Vector3
) {
  const t = Math.min(1, Math.max(0, normTime));

  // Find the segment
  let segStart = WAYPOINTS[0];
  let segEnd = WAYPOINTS[WAYPOINTS.length - 1];

  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    if (t >= WAYPOINTS[i].t && t <= WAYPOINTS[i + 1].t) {
      segStart = WAYPOINTS[i];
      segEnd = WAYPOINTS[i + 1];
      break;
    }
  }

  const segDuration = segEnd.t - segStart.t;
  const segT = segDuration > 0 ? (t - segStart.t) / segDuration : 1;
  const eased = smoothStep(segT);

  outPos.lerpVectors(segStart.pos, segEnd.pos, eased);
  outLook.lerpVectors(segStart.lookAt, segEnd.lookAt, eased);
}

/**
 * CinematicCamera — animated flythrough that sweeps above and around
 * the museum, then descends to the player's eye level.
 * Calls `onComplete` once done so the parent can switch to explore mode.
 */
export default function CinematicCamera({ onComplete }: CinematicCameraProps) {
  const { camera } = useThree();
  const elapsed = useRef(0);
  const done = useRef(false);
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());

  const finish = useCallback(() => {
    if (!done.current) {
      done.current = true;
      onComplete();
    }
  }, [onComplete]);

  useFrame((_, delta) => {
    if (done.current) return;

    elapsed.current += delta;
    const norm = Math.min(elapsed.current / DURATION, 1);

    samplePath(norm, tmpPos.current, tmpLook.current);
    camera.position.copy(tmpPos.current);
    camera.lookAt(tmpLook.current);

    if (norm >= 1) {
      finish();
    }
  });

  return null;
}
