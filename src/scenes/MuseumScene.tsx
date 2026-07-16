"use client";

import { useMemo, Suspense } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import ExhibitObject from "@/components/ExhibitObject";
import { museumData } from "@/utils/museumData";

// Simple seedable pseudo-random generator to remain pure and satisfy react-hooks/purity rules
function createRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const ROOM_WIDTH = 24;
const ROOM_DEPTH = 28;
const ROOM_HEIGHT = 6.2;

export default function MuseumScene() {
  // ── Procedural Polished White Marble Floor Texture ──
  const floorTexture = useMemo(() => {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const random = createRandom(42); // deterministic seed

    // Clean warm-white base marble slab
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, size, size);

    // Large primary soft grey veins
    ctx.strokeStyle = "rgba(90, 90, 90, 0.07)";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      let x = random() * size;
      let y = 0;
      ctx.lineWidth = random() * 2.5 + 1.2;
      ctx.moveTo(x, y);

      while (y < size) {
        x += (random() - 0.5) * 50;
        y += random() * 70 + 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Finer secondary veins for visual depth
    ctx.strokeStyle = "rgba(130, 130, 130, 0.04)";
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      let x = 0;
      let y = random() * size;
      ctx.lineWidth = random() * 1.2 + 0.6;
      ctx.moveTo(x, y);

      while (x < size) {
        x += random() * 70 + 20;
        y += (random() - 0.5) * 50;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // Tiling size matches standard dimensions nicely
    texture.repeat.set(ROOM_WIDTH / 5, ROOM_DEPTH / 5);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // ── Procedural Concrete Texture for Planters ──
  const concreteTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const random = createRandom(1337); // different seed for concrete texture

    ctx.fillStyle = "#bbbbbb";
    ctx.fillRect(0, 0, size, size);

    // Speckles
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(random() * size, random() * size, 1.5, 1.5);
    }
    // Light noise
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let i = 0; i < 300; i++) {
      ctx.fillRect(random() * size, random() * size, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  return (
    <group>
      {/* ── Lighting System ── */}
      {/* Soft warm ambient layer to represent background museum acoustics */}
      <ambientLight intensity={0.16} color="#FFF2E5" />
      <hemisphereLight args={["#ffffff", "#d6d3d1", 0.28]} />

      {/* Primary keylight casting soft, directional gallery shadows */}
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0002}
      />

      {/* ── Floor (Glossy Polished Marble) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial
          map={floorTexture}
          roughness={0.12}
          metalness={0.08}
        />
      </mesh>

      {/* ── Ceiling Architecture ── */}
      {/* Main ceiling plaster plate */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#fcfcfc" roughness={0.88} side={THREE.DoubleSide} />
      </mesh>

      {/* Structural Ceiling Beams */}
      {[-9, -3, 3, 9].map((pos, i) => (
        <mesh key={`beam-${i}`} position={[pos, ROOM_HEIGHT - 0.16, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.36, 0.32, ROOM_DEPTH]} />
          <meshStandardMaterial color="#eeeeee" roughness={0.8} />
        </mesh>
      ))}

      {/* Glowing Emissive LED Lines running along the ceiling beams */}
      {[-9, -3, 3, 9].map((pos, i) => (
        <mesh key={`led-${i}`} position={[pos, ROOM_HEIGHT - 0.31, 0]}>
          <boxGeometry args={[0.06, 0.01, ROOM_DEPTH - 4]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* ── Wall Architecture (Base Walls + Modular Gallery Panels) ── */}

      {/* Base Back Wall (Z = -14) */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.85} />
      </mesh>

      {/* Base Front Wall (Z = 14) */}
      <mesh position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.85} />
      </mesh>

      {/* Base Left Wall (X = -12) */}
      <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.85} />
      </mesh>

      {/* Base Right Wall (X = 12) */}
      <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.85} />
      </mesh>

      {/* Left Wall Panels (X = -11.92) behind left exhibits */}
      {[-6, -2, 2, 6, 10].map((z, i) => (
        <group key={`l-wall-panel-${i}`}>
          {/* Subtle offset metal border frame */}
          <mesh position={[-11.95, (ROOM_HEIGHT - 0.6) / 2 + 0.3, z]}>
            <boxGeometry args={[0.02, ROOM_HEIGHT - 1.2, 3.1]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
          </mesh>
          {/* Pure white raised display plaster panel */}
          <mesh position={[-11.92, (ROOM_HEIGHT - 0.6) / 2 + 0.3, z]} receiveShadow castShadow>
            <boxGeometry args={[0.04, ROOM_HEIGHT - 1.3, 3.0]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
          {/* Vertical decorative structural groove line */}
          <mesh position={[-11.88, (ROOM_HEIGHT - 0.6) / 2 + 0.3, z - 1.55]}>
            <boxGeometry args={[0.02, ROOM_HEIGHT - 1.3, 0.02]} />
            <meshStandardMaterial color="#121212" roughness={0.9} />
          </mesh>
          {/* Interactive highlight LED strip */}
          <mesh position={[-11.89, 0.6, z]}>
            <boxGeometry args={[0.015, 0.9, 0.015]} />
            <meshStandardMaterial
              color="#CB2957"
              emissive="#CB2957"
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* Right Wall Panels (X = 11.92) behind right exhibits */}
      {[-6, -2, 2, 6, 10].map((z, i) => (
        <group key={`r-wall-panel-${i}`}>
          {/* Subtle offset metal border frame */}
          <mesh position={[11.95, (ROOM_HEIGHT - 0.6) / 2 + 0.3, z]}>
            <boxGeometry args={[0.02, ROOM_HEIGHT - 1.2, 3.1]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
          </mesh>
          {/* Pure white raised display plaster panel */}
          <mesh position={[11.92, (ROOM_HEIGHT - 0.6) / 2 + 0.3, z]} receiveShadow castShadow>
            <boxGeometry args={[0.04, ROOM_HEIGHT - 1.3, 3.0]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
          {/* Vertical decorative structural groove line */}
          <mesh position={[11.88, (ROOM_HEIGHT - 0.6) / 2 + 0.3, z + 1.55]}>
            <boxGeometry args={[0.02, ROOM_HEIGHT - 1.3, 0.02]} />
            <meshStandardMaterial color="#121212" roughness={0.9} />
          </mesh>
          {/* Interactive highlight LED strip */}
          <mesh position={[11.89, 0.6, z]}>
            <boxGeometry args={[0.015, 0.9, 0.015]} />
            <meshStandardMaterial
              color="#CB2957"
              emissive="#CB2957"
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* ── Wall Graphics & Branding ── */}
      {/* School motto / Welcome message on the front wall facing player at entrance */}
      <Suspense fallback={null}>
        <group position={[0, 3.2, -13.88]}>
          <Text
            fontSize={0.58}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.02}
          >
            SMK TELKOM SIDOARJO
          </Text>
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.24}
            color="#CB2957"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.16}
          >
            KNOWLEDGE - SKILL - CHARACTER
          </Text>
        </group>
      </Suspense>

      {/* Vision & Mission Display Panel (Left front corner, Z = -13.6) */}
      <group position={[-6.8, 2.5, -13.8]} rotation={[0, 0, 0]}>
        {/* Glass panel — no receiveShadow: prevents ceiling-beam shadow banding over text */}
        <mesh castShadow>
          <boxGeometry args={[3.2, 2.8, 0.06]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} transparent opacity={0.88} />
        </mesh>
        {/* Metal frame */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[3.3, 2.9, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        {/* Typography */}
        <Suspense fallback={null}>
          <Text
            position={[0, 1.1, 0.08]}
            fontSize={0.16}
            color="#CB2957"
            anchorX="center"
            anchorY="middle"
          >
            VISI SEKOLAH
          </Text>
          <Text
            position={[0, 0.5, 0.08]}
            fontSize={0.11}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.8}
            textAlign="center"
          >
            Menjadi sekolah unggulan yang menghasilkan lulusan berkarakter, berdaya saing global, dan menguasai teknologi informasi.
          </Text>
          <Text
            position={[0, -0.2, 0.08]}
            fontSize={0.16}
            color="#CB2957"
            anchorX="center"
            anchorY="middle"
          >
            MISI UTAMA
          </Text>
          <Text
            position={[0, -0.8, 0.08]}
            fontSize={0.10}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.8}
            textAlign="center"
          >
            1. Menyelenggarakan pendidikan berbasis IT berkualitas tinggi.{"\n"}
            2. Membentuk akhlak mulia dan budaya gotong royong.{"\n"}
            3. Membuka jaringan kemitraan dengan industri nasional & global.
          </Text>
        </Suspense>
      </group>

      {/* History Timeline Wall (Right front corner, Z = -13.6) */}
      <group position={[6.8, 2.5, -13.8]}>
        {/* Glass panel — no receiveShadow: prevents ceiling-beam shadow banding over text */}
        <mesh castShadow>
          <boxGeometry args={[3.2, 2.8, 0.06]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} transparent opacity={0.88} />
        </mesh>
        {/* Metal frame */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[3.3, 2.9, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        {/* Timeline Text */}
        <Suspense fallback={null}>
          <Text
            position={[0, 1.1, 0.08]}
            fontSize={0.16}
            color="#CB2957"
            anchorX="center"
            anchorY="middle"
          >
            LINI MASA SEKOLAH
          </Text>
        </Suspense>
        {/* Timeline Nodes */}
        {[-0.6, -0.1, 0.4].map((y, idx) => (
          <group key={idx} position={[0, y, 0.04]}>
            <mesh position={[-1.2, 0, 0]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshBasicMaterial color="#CB2957" />
            </mesh>
          </group>
        ))}
        <Suspense fallback={null}>
          {/* 2019 */}
          <Text
            position={[0.1, 0.52, 0.08]}
            fontSize={0.10}
            color="#CB2957"
            anchorX="left"
            anchorY="middle"
          >
            2019
          </Text>
          <Text
            position={[0.1, 0.38, 0.08]}
            fontSize={0.085}
            color="#000000"
            anchorX="left"
            anchorY="middle"
            maxWidth={2.1}
          >
            SMK Telkom Sidoarjo didirikan untuk memenuhi kebutuhan talenta digital di Jawa Timur.
          </Text>
          {/* 2021 */}
          <Text
            position={[0.1, 0.02, 0.08]}
            fontSize={0.10}
            color="#CB2957"
            anchorX="left"
            anchorY="middle"
          >
            2021
          </Text>
          <Text
            position={[0.1, -0.12, 0.08]}
            fontSize={0.085}
            color="#000000"
            anchorX="left"
            anchorY="middle"
            maxWidth={2.1}
          >
            Peresmian lab IoT &amp; robotika modern sebagai pusat pembelajaran praktis siswa.
          </Text>
          {/* 2024 */}
          <Text
            position={[0.1, -0.48, 0.08]}
            fontSize={0.10}
            color="#CB2957"
            anchorX="left"
            anchorY="middle"
          >
            2024
          </Text>
          <Text
            position={[0.1, -0.62, 0.08]}
            fontSize={0.085}
            color="#000000"
            anchorX="left"
            anchorY="middle"
            maxWidth={2.1}
          >
            Meraih Akreditasi A serta penghargaan Sekolah Unggulan Berbasis Karakter.
          </Text>
        </Suspense>
      </group>

      {/* ── Grand Lobby Centerpiece (X = 0, Z = -2) ── */}
      <group position={[0, 0, -2]}>
        {/* Double-tiered Plinth */}
        <mesh receiveShadow castShadow position={[0, 0.05, 0]}>
          <cylinderGeometry args={[1.5, 1.6, 0.1, 32]} />
          <meshStandardMaterial color="#121212" roughness={0.7} />
        </mesh>
        <mesh receiveShadow castShadow position={[0, 0.16, 0]}>
          <cylinderGeometry args={[1.3, 1.3, 0.12, 32]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.2} metalness={0.05} />
        </mesh>

        {/* Emissive red lighting ring */}
        <mesh position={[0, 0.23, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.28, 0.02, 8, 48]} />
          <meshStandardMaterial
            color="#CB2957"
            emissive="#CB2957"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>

        {/* Abstract interlocking geometric centerpiece sculpture */}
        <group position={[0, 1.6, 0]}>
          {/* Ring 1 - Vertical red accent */}
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.7, 0.08, 16, 48]} />
            <meshStandardMaterial color="#CB2957" roughness={0.25} metalness={0.65} />
          </mesh>
          {/* Ring 2 - Angled matte black */}
          <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
            <torusGeometry args={[0.72, 0.08, 16, 48]} />
            <meshStandardMaterial color="#181818" roughness={0.6} metalness={0.8} />
          </mesh>
          {/* Ring 3 - Angled chrome steel */}
          <mesh rotation={[Math.PI / 3, -Math.PI / 4, 0]}>
            <torusGeometry args={[0.74, 0.08, 16, 48]} />
            <meshStandardMaterial color="#dddddd" roughness={0.05} metalness={0.95} />
          </mesh>

          {/* Core sphere light */}
          <mesh>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={2.0}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Centerpiece Spotlight casting drama shadows */}
        <spotLight
          position={[0, 0.25, 0]}
          target-position={[0, 5.5, 0]}
          angle={0.6}
          penumbra={0.5}
          intensity={9}
          color="#FFF0E5"
        />
        <pointLight position={[0, 1.6, 0]} intensity={1.8} distance={6} color="#CB2957" />
      </group>

      {/* ── Environmental Space Fillers (Plants, Benches, Dividers) ── */}

      {/* Gallery Benches (x = 0, z = -7 and z = 5) */}
      {[ -7, 5 ].map((z, idx) => (
        <group key={`bench-${idx}`} position={[0, 0, z]}>
          {/* Wooden slatted seat */}
          <mesh castShadow receiveShadow position={[0, 0.44, 0]}>
            <boxGeometry args={[2.0, 0.08, 0.6]} />
            <meshStandardMaterial color="#c7a785" roughness={0.4} />
          </mesh>
          {/* Black metal legs */}
          <mesh castShadow position={[-0.8, 0.2, 0]}>
            <boxGeometry args={[0.08, 0.4, 0.52]} />
            <meshStandardMaterial color="#111111" roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0.8, 0.2, 0]}>
            <boxGeometry args={[0.08, 0.4, 0.52]} />
            <meshStandardMaterial color="#111111" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Concrete Planters with Stylized Indoor Plants */}
      {[
        [-3.6, -11.5],
        [3.6, -11.5],
        [-8.2, -1.8],
        [8.2, -1.8],
        [-3.8, 12.0],
        [3.8, 12.0],
      ].map(([x, z], idx) => (
        <group key={`planter-${idx}`} position={[x, 0, z]}>
          {/* Concrete container box */}
          <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.38, 0.42, 0.6, 16]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.88} />
          </mesh>
          {/* Dark soil */}
          <mesh position={[0, 0.58, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.02, 16]} />
            <meshStandardMaterial color="#3e2723" roughness={0.9} />
          </mesh>
          {/* Stylized trunk */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.03, 0.5, 8]} />
            <meshStandardMaterial color="#5d4037" roughness={0.8} />
          </mesh>
          {/* Low-poly green foliage balls */}
          <group position={[0, 1.1, 0]}>
            <mesh castShadow position={[0, 0.16, 0]}>
              <sphereGeometry args={[0.26, 8, 8]} />
              <meshStandardMaterial color="#2e7d32" roughness={0.9} />
            </mesh>
            <mesh castShadow position={[-0.14, -0.06, 0.08]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial color="#1b5e20" roughness={0.9} />
            </mesh>
            <mesh castShadow position={[0.14, -0.06, -0.08]}>
              <sphereGeometry args={[0.22, 8, 8]} />
              <meshStandardMaterial color="#388e3c" roughness={0.9} />
            </mesh>
          </group>
        </group>
      ))}

      {/* ── Interactive Exhibits ── */}
      {/* ExhibitObject now self-registers its collider with InteractionStore on mount.
          No props needed here — interaction is fully centralized in InteractionManager. */}
      {museumData.map((item) => (
        <ExhibitObject
          key={item.id}
          item={item}
        />
      ))}
    </group>
  );
}
