"use client";

import { useMemo } from "react";
import * as THREE from "three";
import ExhibitObject from "@/components/ExhibitObject";
import { museumData, type ExhibitItem } from "@/utils/museumData";

const ROOM_WIDTH = 24;
const ROOM_DEPTH = 28;
const ROOM_HEIGHT = 6;

interface MuseumSceneProps {
  onSelectExhibit: (item: ExhibitItem) => void;
}

/**
 * Ruangan museum 3D sederhana: lantai, dinding, plafon + lighting.
 * Material dipoles (roughness/metalness + procedural checker lantai) supaya
 * primitif geometris tetap enak dilihat sebelum diganti model Blender asli.
 */
export default function MuseumScene({ onSelectExhibit }: MuseumSceneProps) {
  // Texture lantai checker sederhana dibuat procedural (tanpa file gambar)
  const floorTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const tiles = 8;
    const tileSize = size / tiles;
    for (let y = 0; y < tiles; y++) {
      for (let x = 0; x < tiles; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#e7e5e4" : "#d6d3d1";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(ROOM_WIDTH / 4, ROOM_DEPTH / 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <hemisphereLight args={["#dbeafe", "#78716c", 0.4]} />

      {/* Lantai */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial map={floorTexture} roughness={0.8} metalness={0.05} />
      </mesh>

      {/* Plafon */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Dinding belakang & depan */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#eef2ff" roughness={0.85} />
      </mesh>
      <mesh
        position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
      >
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#eef2ff" roughness={0.85} />
      </mesh>

      {/* Dinding kiri & kanan */}
      <mesh
        position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e0e7ff" roughness={0.85} />
      </mesh>
      <mesh
        position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e0e7ff" roughness={0.85} />
      </mesh>

      {/* Objek interaktif */}
      {museumData.map((item) => (
        <ExhibitObject key={item.id} item={item} onSelect={onSelectExhibit} />
      ))}
    </group>
  );
}
