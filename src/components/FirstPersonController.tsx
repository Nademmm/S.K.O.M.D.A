"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";

const MOVE_SPEED = 5; // meter per detik
const ROOM_HALF_WIDTH = 11; // batas collision sumbu X
const ROOM_HALF_DEPTH = 13; // batas collision sumbu Z
const PLAYER_RADIUS = 0.5;
const EYE_HEIGHT = 1.6;

/**
 * Kontrol first-person: WASD/arrow untuk bergerak, mouse (Pointer Lock) untuk
 * menoleh, dengan collision sederhana berupa batas kotak ruangan museum.
 */
export default function FirstPersonController() {
  const { camera } = useThree();
  const keys = useKeyboardControls();
  const direction = useRef(new THREE.Vector3());
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const { forward, backward, left, right } = keys.current;

    frontVector.current.set(0, 0, Number(backward) - Number(forward));
    sideVector.current.set(Number(left) - Number(right), 0, 0);

    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(MOVE_SPEED * delta);
    direction.current.applyEuler(
      new THREE.Euler(0, camera.rotation.y, 0)
    );

    const nextX = camera.position.x - direction.current.x;
    const nextZ = camera.position.z - direction.current.z;

    // Collision sederhana: clamp posisi kamera di dalam batas ruangan.
    camera.position.set(
      THREE.MathUtils.clamp(
        nextX,
        -ROOM_HALF_WIDTH + PLAYER_RADIUS,
        ROOM_HALF_WIDTH - PLAYER_RADIUS
      ),
      EYE_HEIGHT,
      THREE.MathUtils.clamp(
        nextZ,
        -ROOM_HALF_DEPTH + PLAYER_RADIUS,
        ROOM_HALF_DEPTH - PLAYER_RADIUS
      )
    );
  });

  return <PointerLockControls />;
}
