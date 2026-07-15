"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { ExhibitIcon } from "@/utils/museumData";

interface HologramIconProps {
  icon: ExhibitIcon;
  color: string;
  /** Faktor intensitas (0 = normal, 1 = saat hover) */
  glow?: number;
}

/**
 * Ikon 3D procedural (tanpa file asset) yang dirender dengan material hologram:
 * transparan + emissive + additive blending, sehingga terlihat seperti proyeksi cahaya.
 * Setiap `icon` menyusun beberapa primitif Three.js menjadi bentuk yang mewakili maknanya.
 */
export default function HologramIcon({ icon, color, glow = 0 }: HologramIconProps) {
  // Satu material hologram dipakai bersama seluruh bagian ikon
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.55,
      metalness: 0.1,
      roughness: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    return mat;
  }, [color]);

  // Perbarui intensitas emissive & opacity sesuai glow (hover)
  material.emissiveIntensity = 0.9 + glow * 0.8;
  material.opacity = 0.55 + glow * 0.25;

  return <group scale={0.5}>{renderIcon(icon, material)}</group>;
}

/** Menyusun primitif menjadi bentuk ikon sesuai jenisnya */
function renderIcon(icon: ExhibitIcon, material: THREE.Material) {
  switch (icon) {
    case "clock":
      // Jam: cincin + dua jarum
      return (
        <group>
          <mesh material={material}>
            <torusGeometry args={[0.5, 0.06, 12, 32]} />
          </mesh>
          <mesh position={[0, 0.15, 0.02]} material={material}>
            <boxGeometry args={[0.05, 0.3, 0.05]} />
          </mesh>
          <mesh
            position={[0.12, 0, 0.02]}
            rotation={[0, 0, Math.PI / 2]}
            material={material}
          >
            <boxGeometry args={[0.05, 0.24, 0.05]} />
          </mesh>
        </group>
      );

    case "uniform":
      // Seragam: badan baju + kerah
      return (
        <group>
          <mesh material={material}>
            <boxGeometry args={[0.55, 0.6, 0.12]} />
          </mesh>
          <mesh position={[-0.4, 0.15, 0]} rotation={[0, 0, 0.5]} material={material}>
            <boxGeometry args={[0.18, 0.45, 0.12]} />
          </mesh>
          <mesh position={[0.4, 0.15, 0]} rotation={[0, 0, -0.5]} material={material}>
            <boxGeometry args={[0.18, 0.45, 0.12]} />
          </mesh>
          <mesh position={[0, 0.35, 0.06]} rotation={[0, 0, Math.PI / 4]} material={material}>
            <boxGeometry args={[0.12, 0.12, 0.05]} />
          </mesh>
        </group>
      );

    case "class":
      // Kelas: papan tulis + garis
      return (
        <group>
          <mesh material={material}>
            <boxGeometry args={[0.8, 0.55, 0.06]} />
          </mesh>
          <mesh position={[-0.1, 0.08, 0.05]} material={material}>
            <boxGeometry args={[0.45, 0.04, 0.02]} />
          </mesh>
          <mesh position={[-0.18, -0.08, 0.05]} material={material}>
            <boxGeometry args={[0.3, 0.04, 0.02]} />
          </mesh>
        </group>
      );

    case "broom":
      // Kebersihan: tetes/daun (bulatan) di atas tangkai
      return (
        <group>
          <mesh material={material}>
            <sphereGeometry args={[0.32, 20, 20]} />
          </mesh>
          <mesh position={[0, -0.45, 0]} material={material}>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          </mesh>
        </group>
      );

    case "shield":
      // Larangan/sanksi: perisai
      return (
        <group>
          <mesh material={material}>
            <cylinderGeometry args={[0.45, 0.45, 0.08, 6]} />
          </mesh>
          <mesh position={[0, 0, 0.06]} material={material}>
            <boxGeometry args={[0.08, 0.5, 0.05]} />
          </mesh>
        </group>
      );

    case "greeting":
      // Salam & sapa: kepala + senyum (torus setengah)
      return (
        <group>
          <mesh material={material}>
            <sphereGeometry args={[0.4, 24, 24]} />
          </mesh>
          <mesh
            position={[0, -0.08, 0.32]}
            rotation={[0, 0, Math.PI]}
            material={material}
          >
            <torusGeometry args={[0.16, 0.04, 12, 20, Math.PI]} />
          </mesh>
        </group>
      );

    case "hands":
      // Gotong royong: dua balok saling menopang
      return (
        <group>
          <mesh rotation={[0, 0, 0.6]} position={[-0.12, 0, 0]} material={material}>
            <boxGeometry args={[0.6, 0.16, 0.16]} />
          </mesh>
          <mesh rotation={[0, 0, -0.6]} position={[0.12, 0, 0]} material={material}>
            <boxGeometry args={[0.6, 0.16, 0.16]} />
          </mesh>
        </group>
      );

    case "trophy":
      // Prestasi: piala (cangkir + kaki)
      return (
        <group>
          <mesh position={[0, 0.15, 0]} material={material}>
            <cylinderGeometry args={[0.3, 0.22, 0.35, 20]} />
          </mesh>
          <mesh position={[0, -0.12, 0]} material={material}>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
          </mesh>
          <mesh position={[0, -0.28, 0]} material={material}>
            <boxGeometry args={[0.3, 0.08, 0.3]} />
          </mesh>
        </group>
      );

    case "flag":
      // Nasionalisme: tiang + bendera
      return (
        <group>
          <mesh position={[-0.3, 0, 0]} material={material}>
            <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
          </mesh>
          <mesh position={[0.05, 0.25, 0]} material={material}>
            <boxGeometry args={[0.55, 0.32, 0.03]} />
          </mesh>
        </group>
      );

    case "culture":
      // Kearifan lokal: bentuk seperti candi/atap bertingkat
      return (
        <group>
          <mesh position={[0, -0.25, 0]} material={material}>
            <boxGeometry args={[0.7, 0.16, 0.7]} />
          </mesh>
          <mesh position={[0, -0.05, 0]} material={material}>
            <boxGeometry args={[0.5, 0.16, 0.5]} />
          </mesh>
          <mesh position={[0, 0.18, 0]} material={material}>
            <coneGeometry args={[0.3, 0.35, 4]} />
          </mesh>
        </group>
      );

    default:
      return (
        <mesh material={material}>
          <icosahedronGeometry args={[0.4, 0]} />
        </mesh>
      );
  }
}
