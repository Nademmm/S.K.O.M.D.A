"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";

const ROOM_HALF_WIDTH = 11; // batas collision sumbu X
const ROOM_HALF_DEPTH = 13; // batas collision sumbu Z
const PLAYER_RADIUS = 0.4; // smooth responsive collision radius
const EYE_HEIGHT = 1.6;
const PITCH_LIMIT = Math.PI / 2 - 0.05; // ±~85° agar tidak flip

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

    const requestLock = (e: PointerEvent) => {
      // Only lock pointer on left click (button 0)
      if (e.button === 0 && document.pointerLockElement !== el) {
        el.requestPointerLock();
      }
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

    // List of static obstacles in the museum for 2D collision detection and resolution
    const OBSTACLES = [
      // 10 Exhibit Pedestals (box of size 0.82 x 0.82)
      { type: "box", x: -9, z: -6, hx: 0.41, hz: 0.41 },
      { type: "box", x: -9, z: -2, hx: 0.41, hz: 0.41 },
      { type: "box", x: -9, z: 2, hx: 0.41, hz: 0.41 },
      { type: "box", x: -9, z: 6, hx: 0.41, hz: 0.41 },
      { type: "box", x: -9, z: 10, hx: 0.41, hz: 0.41 },
      { type: "box", x: 9, z: -6, hx: 0.41, hz: 0.41 },
      { type: "box", x: 9, z: -2, hx: 0.41, hz: 0.41 },
      { type: "box", x: 9, z: 2, hx: 0.41, hz: 0.41 },
      { type: "box", x: 9, z: 6, hx: 0.41, hz: 0.41 },
      { type: "box", x: 9, z: 10, hx: 0.41, hz: 0.41 },

      // Centerpiece (circle of radius 1.62)
      { type: "circle", x: 0, z: -2, r: 1.62 },


    ];

    // Resolve collision
    let resolvedX = nextX;
    let resolvedZ = nextZ;

    // Clamp within outer walls (accounting for panels)
    resolvedX = THREE.MathUtils.clamp(resolvedX, -11.3, 11.3);
    resolvedZ = THREE.MathUtils.clamp(resolvedZ, -13.2, 13.2);

    // Multi-pass resolution to prevent slipping into corners
    for (let pass = 0; pass < 2; pass++) {
      for (const obs of OBSTACLES) {
        if (obs.type === "circle" && obs.r !== undefined) {
          const dx = resolvedX - obs.x;
          const dz = resolvedZ - obs.z;
          const distSq = dx * dx + dz * dz;
          const minDist = PLAYER_RADIUS + obs.r;
          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
              resolvedX = obs.x + (dx / dist) * minDist;
              resolvedZ = obs.z + (dz / dist) * minDist;
            } else {
              resolvedZ = obs.z + minDist;
            }
          }
        } else if (obs.type === "box" && obs.hx !== undefined && obs.hz !== undefined) {
          const minX = obs.x - obs.hx;
          const maxX = obs.x + obs.hx;
          const minZ = obs.z - obs.hz;
          const maxZ = obs.z + obs.hz;

          const px = Math.max(minX, Math.min(resolvedX, maxX));
          const pz = Math.max(minZ, Math.min(resolvedZ, maxZ));
          const dx = resolvedX - px;
          const dz = resolvedZ - pz;
          const distSq = dx * dx + dz * dz;
          if (distSq < PLAYER_RADIUS * PLAYER_RADIUS) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
              resolvedX = px + (dx / dist) * PLAYER_RADIUS;
              resolvedZ = pz + (dz / dist) * PLAYER_RADIUS;
            } else {
              const leftDist = resolvedX - minX;
              const rightDist = maxX - resolvedX;
              const topDist = resolvedZ - minZ;
              const bottomDist = maxZ - resolvedZ;
              const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);
              if (minDist === leftDist) resolvedX = minX - PLAYER_RADIUS;
              else if (minDist === rightDist) resolvedX = maxX + PLAYER_RADIUS;
              else if (minDist === topDist) resolvedZ = minZ - PLAYER_RADIUS;
              else resolvedZ = maxZ + PLAYER_RADIUS;
            }
          }
        }
      }
      // Re-clamp
      resolvedX = THREE.MathUtils.clamp(resolvedX, -11.3, 11.3);
      resolvedZ = THREE.MathUtils.clamp(resolvedZ, -13.2, 13.2);
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
