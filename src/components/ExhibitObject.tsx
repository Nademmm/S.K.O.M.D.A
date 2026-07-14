"use client";

import { useRef, useState } from "react";
import type { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { ExhibitItem } from "@/utils/museumData";

interface ExhibitObjectProps {
  item: ExhibitItem;
  onSelect: (item: ExhibitItem) => void;
}

const PEDESTAL_HEIGHT = 1;
const PANEL_HEIGHT = 1.6;

/**
 * Objek interaktif museum: pedestal + panel informasi.
 * Masih berupa primitif geometris (belum model Blender), tapi dipoles dengan
 * material PBR (roughness/metalness), highlight emissive saat hover, dan
 * label mengambang supaya tetap terasa "museum" walau belum ada asset .glb.
 */
export default function ExhibitObject({ item, onSelect }: ExhibitObjectProps) {
  const [hovered, setHovered] = useState(false);
  const panelRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (panelRef.current) {
      // Sedikit bobbing halus supaya panel terasa "hidup"
      panelRef.current.position.y =
        PEDESTAL_HEIGHT + PANEL_HEIGHT / 2 + Math.sin(state.clock.elapsedTime * 1.2) * 0.03;
    }
  });

  return (
    <group
      position={item.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item);
      }}
    >
      {/* Pedestal */}
      <mesh castShadow receiveShadow position={[0, PEDESTAL_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[0.5, 0.6, PEDESTAL_HEIGHT, 24]} />
        <meshStandardMaterial
          color={hovered ? "#e5e7eb" : "#9ca3af"}
          roughness={0.35}
          metalness={0.15}
          emissive={hovered ? item.color : "#000000"}
          emissiveIntensity={hovered ? 0.25 : 0}
        />
      </mesh>

      {/* Panel informasi */}
      <mesh ref={panelRef} castShadow position={[0, PEDESTAL_HEIGHT + PANEL_HEIGHT / 2, 0]}>
        <boxGeometry args={[1.1, PANEL_HEIGHT, 0.08]} />
        <meshStandardMaterial
          color={item.color}
          roughness={0.5}
          metalness={0.1}
          emissive={hovered ? item.color : "#000000"}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </mesh>

      {/* Label nama objek (muncul saat hover) */}
      {hovered && (
        <Text
          position={[0, PEDESTAL_HEIGHT + PANEL_HEIGHT + 0.5, 0]}
          fontSize={0.28}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#000000"
          maxWidth={2.5}
          textAlign="center"
        >
          {item.title}
        </Text>
      )}

      {/* Titik cahaya lembut di sekitar pedestal untuk highlight lokal */}
      <pointLight
        position={[0, PEDESTAL_HEIGHT + PANEL_HEIGHT, 0.6]}
        intensity={hovered ? 1.2 : 0.3}
        distance={3}
        color={item.color}
      />
    </group>
  );
}
