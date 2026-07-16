"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { museumData } from "@/utils/museumData";

const ROOM_HALF_WIDTH = 11; // batas collision sumbu X
const ROOM_HALF_DEPTH = 13; // batas collision sumbu Z
const PLAYER_RADIUS = 0.5;
const EYE_HEIGHT = 1.6;
const PITCH_LIMIT = Math.PI / 2 - 0.05; // ±~85° agar tidak flip

// Define list of circular obstacles (showcases, pots, centerpiece)
const CIRCLE_OBSTACLES = [
  // 10 Showcases / Exhibit Pedestals
  ...museumData.map((item) => ({
    x: item.position[0],
    z: item.position[2],
    radius: 0.6,
  })),
  // 6 Pots / Concrete Planters
  { x: -3.6, z: -11.5, radius: 0.42 },
  { x: 3.6, z: -11.5, radius: 0.42 },
  { x: -8.2, z: -4.0, radius: 0.42 },
  { x: 8.2, z: -4.0, radius: 0.42 },
  { x: -3.8, z: 12.0, radius: 0.42 },
  { x: 3.8, z: 12.0, radius: 0.42 },
  // Lobby Centerpiece (Orb)
  { x: 0, z: -2, radius: 1.6 },
];

// Define list of box obstacles (Kursi / Benches)
const BOX_OBSTACLES = [
  { x: 0, z: -7, hx: 1.0, hz: 0.3 }, // Bench 1
  { x: 0, z: 5, hx: 1.0, hz: 0.3 },  // Bench 2
];

/** Subset pengaturan yang mempengaruhi kamera first-person secara langsung. */
export interface CameraSettings {
  mouseSensitivity: number;
  cameraSmoothness: number; // 0–100
  cameraFov: number; // derajat
  invertYAxis: boolean;
  mouseAcceleration: boolean;
  cameraShake: boolean;
  walkingSpeed: number;
  runningSpeed: number;
  headBobbing: boolean;
  reduceMotion: boolean;
}

interface FirstPersonControllerProps {
  /** When false, movement is frozen and Pointer Lock is released. */
  enabled?: boolean;
  /** Pengaturan kamera yang diterapkan secara real-time. */
  settings: CameraSettings;
  /** Dipanggil saat pointer lock hilang selagi menjelajah (mis. tekan Esc). */
  onPointerLockLost?: () => void;
}

/**
 * Kontrol first-person: WASD/arrow untuk bergerak, mouse (Pointer Lock) untuk
 * menoleh, dengan collision sederhana berupa batas kotak ruangan museum.
 *
 * Look diproses secara manual (bukan drei PointerLockControls) agar sensitivity,
 * invert Y, akselerasi mouse, dan smoothing kamera bisa diterapkan langsung.
 */
export default function FirstPersonController({
  enabled = true,
  settings,
  onPointerLockLost,
}: FirstPersonControllerProps) {
  const { camera, gl } = useThree();
  const keys = useKeyboardControls();

  // Simpan pengaturan terbaru dalam ref agar useFrame/listener membaca nilai
  // paling baru tanpa perlu re-attach setiap kali props berubah.
  const settingsRef = useRef(settings);
  const lostCbRef = useRef(onPointerLockLost);

  useEffect(() => {
    settingsRef.current = settings;
    lostCbRef.current = onPointerLockLost;
  }, [settings, onPointerLockLost]);

  // Target vs nilai ter-smooth untuk yaw/pitch.
  const targetYaw = useRef(0);
  const targetPitch = useRef(0);
  const curYaw = useRef(0);
  const curPitch = useRef(0);
  const bobPhase = useRef(0);
  const moveAmount = useRef(0); // 0–1, seberapa aktif bergerak (untuk bob)

  // Vektor kerja (reuse agar tidak alokasi tiap frame).
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));

  // Inisialisasi yaw/pitch dari orientasi kamera saat mulai menjelajah.
  useEffect(() => {
    if (!enabled) return;
    euler.current.setFromQuaternion(camera.quaternion, "YXZ");
    targetYaw.current = curYaw.current = euler.current.y;
    targetPitch.current = curPitch.current = euler.current.x;
  }, [enabled, camera]);

  // Pointer lock lifecycle + mouse look.
  useEffect(() => {
    if (!enabled) return;
    const el = gl.domElement;

    const requestLock = () => {
      if (document.pointerLockElement !== el) el.requestPointerLock();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== el) return;
      const s = settingsRef.current;

      let dx = e.movementX;
      let dy = e.movementY;

      // Akselerasi mouse: perbesar gerakan cepat secara non-linear.
      if (s.mouseAcceleration) {
        const magnitude = Math.hypot(dx, dy);
        const boost = 1 + Math.min(magnitude / 12, 2.2) * 0.6;
        dx *= boost;
        dy *= boost;
      }

      const sens = s.mouseSensitivity * 0.0022;
      targetYaw.current -= dx * sens;
      targetPitch.current -= (s.invertYAxis ? -dy : dy) * sens;
      targetPitch.current = THREE.MathUtils.clamp(
        targetPitch.current,
        -PITCH_LIMIT,
        PITCH_LIMIT
      );
    };

    const onLockChange = () => {
      // Kehilangan lock selagi enabled = pengguna menekan Esc / keluar → pause.
      if (document.pointerLockElement !== el) {
        lostCbRef.current?.();
      }
    };

    el.addEventListener("pointerdown", requestLock);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onLockChange);

    return () => {
      el.removeEventListener("pointerdown", requestLock);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onLockChange);
      if (document.pointerLockElement === el) document.exitPointerLock();
    };
  }, [enabled, gl]);

  // eslint-disable-next-line react-hooks/immutability
  useFrame((state, delta) => {
    const s = settingsRef.current;
    const cam = camera as THREE.PerspectiveCamera;

    // ── FOV live update ──────────────────────────────────────────────────
    if (cam.isPerspectiveCamera && Math.abs(cam.fov - s.cameraFov) > 0.01) {
      // eslint-disable-next-line react-hooks/immutability
      cam.fov = s.cameraFov;
      cam.updateProjectionMatrix();
    }

    if (!enabled) return;

    // ── Smoothing kamera ────────────────────────────────────────────────
    // smoothness 0 → responsif instan; 100 → sangat halus (peredaman tinggi).
    const responsiveness = THREE.MathUtils.lerp(1, 0.08, s.cameraSmoothness / 100);
    const alpha =
      responsiveness >= 1 ? 1 : 1 - Math.pow(1 - responsiveness, delta * 60);
    curYaw.current += (targetYaw.current - curYaw.current) * alpha;
    curPitch.current += (targetPitch.current - curPitch.current) * alpha;

    // ── Camera shake (halus, dinonaktifkan saat reduce motion) ───────────
    let shakeYaw = 0;
    let shakePitch = 0;
    if (s.cameraShake && !s.reduceMotion) {
      const t = state.clock.elapsedTime;
      const amp = 0.0016;
      shakeYaw = (Math.sin(t * 13.1) + Math.sin(t * 7.7)) * amp;
      shakePitch = (Math.sin(t * 11.3) + Math.sin(t * 5.9)) * amp;
    }

    euler.current.set(
      curPitch.current + shakePitch,
      curYaw.current + shakeYaw,
      0,
      "YXZ"
    );
    camera.quaternion.setFromEuler(euler.current);

    // ── Pergerakan WASD ─────────────────────────────────────────────────
    const { forward, backward, left, right, sprint } = keys.current;
    const speed = sprint ? s.runningSpeed : s.walkingSpeed;

    camera.getWorldDirection(frontVector.current);
    frontVector.current.y = 0;
    frontVector.current.normalize();
    sideVector.current.crossVectors(frontVector.current, camera.up).normalize();

    const forwardAmount = Number(forward) - Number(backward);
    const rightAmount = Number(right) - Number(left);

    direction.current.set(0, 0, 0);
    const isMoving = forwardAmount !== 0 || rightAmount !== 0;
    if (isMoving) {
      direction.current
        .addScaledVector(frontVector.current, forwardAmount)
        .addScaledVector(sideVector.current, rightAmount)
        .normalize()
        .multiplyScalar(speed * delta);
    }

    // Hitung posisi kandidat berikutnya setelah bergerak
    const nextX = camera.position.x + direction.current.x;
    const nextZ = camera.position.z + direction.current.z;

    // ── Collision Resolution (Dinding + Obstacles) ──────────────────────
    let resolvedX = nextX;
    let resolvedZ = nextZ;

    // Lakukan 3 iterasi untuk menjamin penyelesaian tumpang tindih secara simultan
    for (let iter = 0; iter < 3; iter++) {
      // 1. Dinding ruangan (Clamp)
      resolvedX = THREE.MathUtils.clamp(
        resolvedX,
        -ROOM_HALF_WIDTH + PLAYER_RADIUS,
        ROOM_HALF_WIDTH - PLAYER_RADIUS
      );
      resolvedZ = THREE.MathUtils.clamp(
        resolvedZ,
        -ROOM_HALF_DEPTH + PLAYER_RADIUS,
        ROOM_HALF_DEPTH - PLAYER_RADIUS
      );

      // 2. Obstacle Lingkaran (Showcases, Pots, Centerpiece Orb)
      for (const obs of CIRCLE_OBSTACLES) {
        const dx = resolvedX - obs.x;
        const dz = resolvedZ - obs.z;
        const distSq = dx * dx + dz * dz;
        const combinedR = PLAYER_RADIUS + obs.radius;

        if (distSq < combinedR * combinedR && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const overlap = combinedR - dist;
          resolvedX += (dx / dist) * overlap;
          resolvedZ += (dz / dist) * overlap;
        }
      }

      // 3. Obstacle Box (Kursi / Benches)
      for (const bench of BOX_OBSTACLES) {
        const minX = bench.x - bench.hx;
        const maxX = bench.x + bench.hx;
        const minZ = bench.z - bench.hz;
        const maxZ = bench.z + bench.hz;

        const closestX = Math.max(minX, Math.min(resolvedX, maxX));
        const closestZ = Math.max(minZ, Math.min(resolvedZ, maxZ));

        const dx = resolvedX - closestX;
        const dz = resolvedZ - closestZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < PLAYER_RADIUS * PLAYER_RADIUS) {
          const dist = Math.sqrt(distSq);
          if (dist > 0.0001) {
            const overlap = PLAYER_RADIUS - dist;
            resolvedX += (dx / dist) * overlap;
            resolvedZ += (dz / dist) * overlap;
          } else {
            // Jika berada tepat di dalam box, dorong keluar ke sisi terdekat
            const distToMinX = Math.abs(resolvedX - minX);
            const distToMaxX = Math.abs(resolvedX - maxX);
            const distToMinZ = Math.abs(resolvedZ - minZ);
            const distToMaxZ = Math.abs(resolvedZ - maxZ);

            const minDist = Math.min(distToMinX, distToMaxX, distToMinZ, distToMaxZ);
            if (minDist === distToMinX) resolvedX = minX - PLAYER_RADIUS;
            else if (minDist === distToMaxX) resolvedX = maxX + PLAYER_RADIUS;
            else if (minDist === distToMinZ) resolvedZ = minZ - PLAYER_RADIUS;
            else resolvedZ = maxZ + PLAYER_RADIUS;
          }
        }
      }
    }

    // ── Head bobbing ────────────────────────────────────────────────────
    const bobActive = s.headBobbing && !s.reduceMotion;
    const targetMove = isMoving ? 1 : 0;
    moveAmount.current += (targetMove - moveAmount.current) * Math.min(1, delta * 10);

    let bobOffset = 0;
    if (bobActive) {
      bobPhase.current += delta * speed * 1.9;
      bobOffset = Math.sin(bobPhase.current) * 0.045 * moveAmount.current;
    }

    camera.position.set(resolvedX, EYE_HEIGHT + bobOffset, resolvedZ);
  });

  // Look ditangani manual; komponen ini tidak merender objek scene.
  return null;
}
