"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";

const MOVE_SPEED = 5;
const ROOM_HALF_WIDTH = 11;
const ROOM_HALF_DEPTH = 13;
const PLAYER_RADIUS = 0.5;
const EYE_HEIGHT = 1.6;
const MOUSE_SENSITIVITY = 0.002;

// Semua objek THREE dibuat sekali di modul-level untuk menghindari
// alokasi baru setiap frame (penyebab jitter & GC spike).
const _yawQuat   = new THREE.Quaternion();
const _pitchQuat = new THREE.Quaternion();
const _WORLD_UP  = new THREE.Vector3(0, 1, 0);
const _LOCAL_X   = new THREE.Vector3(1, 0, 0);
const _forward   = new THREE.Vector3();
const _right     = new THREE.Vector3();
const _moveDir   = new THREE.Vector3();

/**
 * Kontrol first-person berbasis Quaternion murni (tanpa Euler).
 *
 * Kenapa Quaternion?
 *   - Euler + PointerLockControls / rotation.order menyebabkan gimbal-lock
 *     di sudut-sudut tertentu → kamera glitch / melompat.
 *   - Quaternion tidak punya gimbal-lock; yaw & pitch dikomposes
 *     secara independen lalu di-multiply.
 *
 * Alur:
 *   1. Mouse move → akumulasi yaw & pitch (plain number, bukan objek THREE)
 *   2. useFrame → bangun _yawQuat dari yaw, _pitchQuat dari pitch,
 *      lalu camera.quaternion = yawQuat * pitchQuat
 *   3. Gerakan WASD selalu memakai _yawQuat (arah datar, tanpa pitch)
 *      supaya pemain tidak terbang/menyelam saat menengadah.
 */
export default function FirstPersonController() {
  const { camera, gl } = useThree();
  const keys = useKeyboardControls();

  const yaw   = useRef(0);   // radian, diakumulasi dari mouse X
  const pitch = useRef(0);   // radian, diakumulasi dari mouse Y

  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      yaw.current   -= e.movementX * MOUSE_SENSITIVITY;
      pitch.current -= e.movementY * MOUSE_SENSITIVITY;
      // Clamp pitch agar tidak bisa jungkir balik
      pitch.current = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch.current));
    };

    const onClick = () => canvas.requestPointerLock();

    canvas.addEventListener("click", onClick);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      canvas.removeEventListener("click", onClick);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [gl]);

  useFrame((_, delta) => {
    // --- Rotasi kamera: Quaternion murni, tanpa Euler ---
    // Yaw  : putar di sekitar sumbu Y dunia (kiri/kanan)
    // Pitch: putar di sekitar sumbu X lokal (atas/bawah)
    // Urutan: yaw dulu, lalu pitch — ini standar FPS yang benar.
    _yawQuat.setFromAxisAngle(_WORLD_UP, yaw.current);
    _pitchQuat.setFromAxisAngle(_LOCAL_X, pitch.current);
    camera.quaternion.copy(_yawQuat).multiply(_pitchQuat);

    // --- Gerakan WASD: hanya pakai yaw (datar di XZ, abaikan pitch) ---
    const { forward, backward, left, right } = keys.current;
    const fwd    = Number(forward)  - Number(backward);
    const strafe = Number(right) - Number(left);

    if (fwd !== 0 || strafe !== 0) {
      // Hitung arah maju & kanan dari yaw saja
      _forward.set(0, 0, -1).applyQuaternion(_yawQuat);
      _right.set(1, 0, 0).applyQuaternion(_yawQuat);

      _moveDir
        .set(0, 0, 0)
        .addScaledVector(_forward, fwd)
        .addScaledVector(_right, strafe)
        .normalize()
        .multiplyScalar(MOVE_SPEED * delta);

      camera.position.x = THREE.MathUtils.clamp(
        camera.position.x + _moveDir.x,
        -ROOM_HALF_WIDTH + PLAYER_RADIUS,
        ROOM_HALF_WIDTH - PLAYER_RADIUS
      );
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + _moveDir.z,
        -ROOM_HALF_DEPTH + PLAYER_RADIUS,
        ROOM_HALF_DEPTH - PLAYER_RADIUS
      );
    }

    // Tinggi mata selalu tetap (tidak terpengaruh pitch)
    camera.position.y = EYE_HEIGHT;
  });

  return null;
}
