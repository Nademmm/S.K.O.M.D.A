"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import HologramIcon from "@/components/HologramIcon";
import type { ExhibitItem } from "@/utils/museumData";
import {
  registerCollider,
  unregisterCollider,
  interactionState,
} from "@/interaction/InteractionStore";

interface ExhibitObjectProps {
  item: ExhibitItem;
}

const PEDESTAL_HEIGHT = 0.95;
const HOLO_CENTER_Y = PEDESTAL_HEIGHT + 0.9;

/**
 * Premium Exhibit Pedestal & Hologram.
 *
 * Interaction Architecture (post-refactor):
 * - No R3F pointer events (onPointerOver/Out/Click) — these caused false-positive
 *   crosshair activations on child meshes (LED rings, cone beams, plaques, etc.)
 * - One invisible box collider mesh is registered with InteractionStore on mount.
 *   ONLY this mesh is ever raycasted by InteractionManager.
 * - Hover state is read from `interactionState` via useFrame, not via R3F events.
 *   Animations update directly via refs — zero React re-renders per frame.
 * - React `useState(hovered)` is still used for the floating title overlay JSX,
 *   but is updated ONLY when the boolean value changes (2x per hover cycle).
 */
export default function ExhibitObject({ item }: ExhibitObjectProps) {
  // Only drives conditional JSX (floating title). Updated at most 2x per hover cycle.
  const [hovered, setHovered] = useState(false);

  const holoRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const coneRef = useRef<Mesh>(null);
  const colliderRef = useRef<Mesh>(null);
  const glowRef = useRef(0);
  // Tracks previous hover value to avoid unnecessary setState calls
  const prevHoveredRef = useRef(false);

  // Plaque faces towards the central aisle (x = 0)
  const isLeftSide = item.position[0] < 0;
  const plaqueRotationY = isLeftSide ? Math.PI / 2 : -Math.PI / 2;
  const plaqueOffsetX = isLeftSide ? 0.42 : -0.42;

  // ── Register invisible collider with the centralized InteractionManager ──
  // The collider is a box covering the full pedestal + hologram stack.
  // It is the ONLY surface that InteractionManager raycasts against for this exhibit.
  useEffect(() => {
    const mesh = colliderRef.current;
    if (!mesh) return;
    registerCollider(item.id, mesh);
    return () => unregisterCollider(item.id);
  }, [item.id]);

  // ── Per-frame animation + hover state read ───────────────────────────────
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Read hover directly from the store — no R3F events, no setState per frame
    const nowHovered = interactionState.hoveredId === item.id;

    // Update React state only on change — avoids constant re-renders
    if (nowHovered !== prevHoveredRef.current) {
      prevHoveredRef.current = nowHovered;
      setHovered(nowHovered);
    }

    // Smooth glow lerp (runs every frame via refs, zero re-renders)
    const target = nowHovered ? 1 : 0;
    glowRef.current += (target - glowRef.current) * Math.min(1, delta * 6);

    if (holoRef.current) {
      holoRef.current.rotation.y = t * 0.5;
      holoRef.current.position.y = HOLO_CENTER_Y + Math.sin(t * 1.4) * 0.06;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.3;
      const mat = ringRef.current.material as MeshStandardMaterial;
      const pulse = 0.7 + Math.sin(t * 2.2) * 0.15;
      mat.emissiveIntensity = pulse + glowRef.current * 1.5;
    }

    if (coneRef.current) {
      const mat = coneRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + glowRef.current * 0.07;
    }
  });

  return (
    <group position={item.position}>

      {/*
       * ── Invisible Collider (registered with InteractionStore) ──
       * This box covers the full pedestal + hologram column.
       * It is the only mesh that InteractionManager will ever raycast for this exhibit.
       * visible=true is required for Three.js Raycaster to intersect it.
       * Material is fully transparent so it is invisible to the player.
       */}
      <mesh ref={colliderRef} position={[0, 1.0, 0]}>
        <boxGeometry args={[0.9, 2.0, 0.9]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Matte Black Base (Lower Plinth) ── */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[0.82, 0.1, 0.82]} />
        <meshStandardMaterial color="#121212" roughness={0.8} metalness={0.15} />
      </mesh>

      {/* ── Beveled Square Central Column ── */}
      <mesh castShadow receiveShadow position={[0, 0.48, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.26, 0.32, 0.76, 4]} />
        <meshStandardMaterial color="#181818" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* ── Accent LED Glow Ring (Under the Marble Top) ── */}
      <mesh
        ref={ringRef}
        position={[0, PEDESTAL_HEIGHT - 0.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.34, 0.015, 8, 32]} />
        <meshStandardMaterial
          color={item.color}
          emissive={item.color}
          emissiveIntensity={1.0}
          toneMapped={false}
        />
      </mesh>

      {/* ── Polished White Marble Top Plate ── */}
      <mesh castShadow position={[0, PEDESTAL_HEIGHT - 0.03, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.06, 32]} />
        <meshStandardMaterial color="#fcfcfc" roughness={0.15} metalness={0.05} />
      </mesh>

      {/* ── Angled Information Plaque ── */}
      <group position={[plaqueOffsetX, 0.74, 0]} rotation={[0, plaqueRotationY, 0.26]}>
        {/* Plaque backboard (matte black) */}
        <mesh castShadow>
          <boxGeometry args={[0.02, 0.14, 0.28]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.65} />
        </mesh>
        {/* Label face (printed white card) */}
        <mesh position={[0.011, 0, 0]}>
          <planeGeometry args={[0.26, 0.12]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
        </mesh>
        {/* Tiny exhibit print — x=0.018 places text clearly in front of face at x=0.011 */}
        <Suspense fallback={null}>
          <Text
            position={[0.018, 0.02, 0]}
            rotation={[0, Math.PI / 2, 0]}
            fontSize={0.024}
            color="#000000"
            anchorX="center"
            anchorY="middle"
          >
            {item.category.toUpperCase().replace("-", " ")}
          </Text>
          <Text
            position={[0.018, -0.015, 0]}
            rotation={[0, Math.PI / 2, 0]}
            fontSize={0.02}
            color="#CB2957"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.24}
            textAlign="center"
          >
            {item.title}
          </Text>
        </Suspense>
      </group>

      {/* ── Glowing Cone Projector Beam ── */}
      <mesh ref={coneRef} position={[0, PEDESTAL_HEIGHT + 0.44, 0]}>
        <coneGeometry args={[0.3, 0.9, 32, 1, true]} />
        <meshBasicMaterial
          color={item.color}
          transparent
          opacity={0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Procedural Hologram Icon ── */}
      <group ref={holoRef} position={[0, HOLO_CENTER_Y, 0]}>
        <HologramIcon icon={item.icon} color={item.color} glow={hovered ? 1 : 0} />
      </group>

      {/* ── Spotlight for Pedestal (Warm Gallery Vibe) ── */}
      <spotLight
        position={[0, 4.8, 0]}
        target-position={[0, PEDESTAL_HEIGHT, 0]}
        angle={0.48}
        penumbra={0.7}
        intensity={hovered ? 12 : 7}
        color="#FFF2E5"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* ── Soft Point Light for Glow Falloff ── */}
      <pointLight
        position={[0, HOLO_CENTER_Y, 0]}
        intensity={hovered ? 1.6 : 0.8}
        distance={2.8}
        color={item.color}
      />

      {/* ── Floating Hover Title Overlay ── */}
      {/* Only mounted when hovered (2 mount/unmount events per hover cycle) */}
      {hovered && (
        <Suspense fallback={null}>
          <Text
            position={[0, HOLO_CENTER_Y + 0.85, 0]}
            fontSize={0.22}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#ffffff"
            maxWidth={2.8}
            textAlign="center"
          >
            {item.title}
          </Text>
        </Suspense>
      )}
    </group>
  );
}
