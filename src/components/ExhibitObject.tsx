"use client";

import { useRef, useState } from "react";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import HologramIcon from "@/components/HologramIcon";
import type { ExhibitItem } from "@/utils/museumData";

interface ExhibitObjectProps {
  item: ExhibitItem;
  onSelect: (item: ExhibitItem) => void;
}

const PEDESTAL_HEIGHT = 1;
const HOLO_CENTER_Y = PEDESTAL_HEIGHT + 1.1; // titik pusat hologram melayang

/**
 * Objek interaktif museum: pedestal gelap dengan cincin cahaya + ikon hologram 3D
 * yang melayang, berputar pelan, dan disorot kerucut cahaya (efek proyektor).
 * Semua procedural (tanpa asset .glb), material hologram dari HologramIcon.
 */
export default function ExhibitObject({ item, onSelect }: ExhibitObjectProps) {
  const [hovered, setHovered] = useState(false);
  const holoRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const glowRef = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Interpolasi halus nilai glow menuju target (1 saat hover, 0 saat tidak)
    const target = hovered ? 1 : 0;
    glowRef.current += (target - glowRef.current) * Math.min(1, delta * 6);

    if (holoRef.current) {
      // Berputar pelan + bobbing naik-turun
      holoRef.current.rotation.y = t * 0.6;
      holoRef.current.position.y = HOLO_CENTER_Y + Math.sin(t * 1.5) * 0.08;
    }

    if (ringRef.current) {
      // Cincin cahaya berdenyut, lebih kuat saat hover
      ringRef.current.rotation.z = t * 0.4;
      const mat = ringRef.current.material as MeshStandardMaterial;
      const pulse = 0.6 + Math.sin(t * 2) * 0.2;
      mat.emissiveIntensity = pulse + glowRef.current * 1.2;
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
      {/* Pedestal gelap ramping */}
      <mesh castShadow receiveShadow position={[0, PEDESTAL_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[0.4, 0.55, PEDESTAL_HEIGHT, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Cincin cahaya di puncak pedestal (proyektor hologram) */}
      <mesh
        ref={ringRef}
        position={[0, PEDESTAL_HEIGHT + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.32, 0.04, 16, 48]} />
        <meshStandardMaterial
          color={item.color}
          emissive={item.color}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Kerucut cahaya tipis dari cincin ke hologram */}
      <mesh position={[0, PEDESTAL_HEIGHT + 0.55, 0]}>
        <coneGeometry args={[0.34, 1.1, 32, 1, true]} />
        <meshBasicMaterial
          color={item.color}
          transparent
          opacity={0.06 + (hovered ? 0.06 : 0)}
          depthWrite={false}
        />
      </mesh>

      {/* Ikon hologram melayang */}
      <group ref={holoRef} position={[0, HOLO_CENTER_Y, 0]}>
        <HologramIcon icon={item.icon} color={item.color} glow={hovered ? 1 : 0} />
      </group>

      {/* Cahaya lokal untuk memperkuat kesan glow hologram */}
      <pointLight
        position={[0, HOLO_CENTER_Y, 0.3]}
        intensity={hovered ? 1.4 : 0.6}
        distance={3.5}
        color={item.color}
      />

      {/* Label judul (muncul saat hover) */}
      {hovered && (
        <Text
          position={[0, HOLO_CENTER_Y + 1, 0]}
          fontSize={0.26}
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
    </group>
  );
}
