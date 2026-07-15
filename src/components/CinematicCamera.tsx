"use client";

import { useRef, useCallback, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CinematicCameraProps {
  /** If true, the camera flies through the path. If false, it holds the start position. */
  playing: boolean;
  /** Called once the flythrough finishes. */
  onComplete: () => void;
}

/** Total duration of the cinematic sweep in seconds. */
const DURATION = 4.5;

const WAYPOINTS = [
  new THREE.Vector3(0, 12, 20),
  new THREE.Vector3(10, 8, 10),
  new THREE.Vector3(8, 5, -2),
  new THREE.Vector3(2, 3, 2),
  new THREE.Vector3(0, 1.6, 8), // Final position = first-person spawn point
];

const LOOK_AT_TARGETS = [
  new THREE.Vector3(0, 2, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 2, -4),
  new THREE.Vector3(0, 1.6, -3),
  new THREE.Vector3(0, 1.6, 0),
];

/**
 * Smooth-step easing (ease-in-out cubic).
 */
function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * CinematicCamera — animated flythrough that sweeps above and around
 * the museum, then descends to the player's eye level using smooth CatmullRom splines.
 */
export default function CinematicCamera({ playing, onComplete }: CinematicCameraProps) {
  const { camera } = useThree();
  const elapsed = useRef(0);
  const done = useRef(false);
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());

  // Create smooth spline curves for position and lookAt
  const positionCurve = useMemo(() => new THREE.CatmullRomCurve3(WAYPOINTS, false, 'centripetal'), []);
  const lookAtCurve = useMemo(() => new THREE.CatmullRomCurve3(LOOK_AT_TARGETS, false, 'centripetal'), []);

  const finish = useCallback(() => {
    if (!done.current) {
      done.current = true;
      onComplete();
    }
  }, [onComplete]);

  // Handle the idle state (when mounted but playing is false)
  // Ensure the camera starts exactly at the first waypoint to prevent teleports
  useEffect(() => {
    if (!playing && !done.current) {
      positionCurve.getPoint(0, tmpPos.current);
      lookAtCurve.getPoint(0, tmpLook.current);
      camera.position.copy(tmpPos.current);
      camera.lookAt(tmpLook.current);
    }
  }, [playing, camera, positionCurve, lookAtCurve]);

  useFrame((_, delta) => {
    if (!playing || done.current) return;

    elapsed.current += delta;
    const norm = Math.min(elapsed.current / DURATION, 1);
    const eased = smoothStep(norm);

    // Sample the splines at the eased time
    positionCurve.getPoint(eased, tmpPos.current);
    lookAtCurve.getPoint(eased, tmpLook.current);

    camera.position.copy(tmpPos.current);
    camera.lookAt(tmpLook.current);

    if (norm >= 1) {
      finish();
    }
  });

  return null;
}
