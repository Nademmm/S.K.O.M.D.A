"use client";

import { useMemo, Suspense } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import ExhibitObject from "@/components/ExhibitObject";
import { museumData } from "@/utils/museumData";
import LogoCenterpiece from "@/components/LogoCenterpiece";

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
  // ── Premium Polished White Marble Floor Texture ──
  const floorTexture = useMemo(() => {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const random = createRandom(42);

    // Warm white base slab
    ctx.fillStyle = "#f5f3f0";
    ctx.fillRect(0, 0, size, size);

    // Large primary soft grey veins
    ctx.strokeStyle = "rgba(60, 55, 50, 0.07)";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      let x = random() * size;
      let y = 0;
      ctx.lineWidth = random() * 3 + 1.5;
      ctx.moveTo(x, y);
      while (y < size) {
        x += (random() - 0.5) * 60;
        y += random() * 80 + 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Fine secondary cross-veins for depth
    ctx.strokeStyle = "rgba(110, 100, 90, 0.04)";
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      let x = 0;
      let y = random() * size;
      ctx.lineWidth = random() * 1.5 + 0.5;
      ctx.moveTo(x, y);
      while (x < size) {
        x += random() * 80 + 20;
        y += (random() - 0.5) * 60;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(ROOM_WIDTH / 4, ROOM_DEPTH / 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  return (
    <group>
      {/* ═══════════════════════════════════════════════════════
          LIGHTING SYSTEM — Layered warm premium gallery lighting
          ═══════════════════════════════════════════════════════ */}

      {/* Warm ambient fill */}
      <ambientLight intensity={0.42} color="#FFF8F2" />
      <hemisphereLight args={["#ffffff", "#f0ece6", 0.6]} />

      {/* Primary key light — warm white, casts museum shadows */}
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.5}
        color="#FFF5E8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0001}
      />

      {/* Ceiling bounce point lights — front / center / back zones */}
      <pointLight position={[0, 5.8, -10]} intensity={1.4} color="#FFF8F0" distance={20} />
      <pointLight position={[0, 5.8, 0]} intensity={1.1} color="#FFF5EE" distance={18} />
      <pointLight position={[0, 5.8, 10]} intensity={1.4} color="#FFF8F0" distance={20} />

      {/* Side wall wash spots */}
      <spotLight
        position={[-10, 5.2, 0]}
        angle={0.75}
        penumbra={0.65}
        intensity={3.5}
        color="#FFF5EE"
        castShadow={false}
      />
      <spotLight
        position={[10, 5.2, 0]}
        angle={0.75}
        penumbra={0.65}
        intensity={3.5}
        color="#FFF5EE"
        castShadow={false}
      />

      {/* Back feature wall uplighting */}
      <spotLight
        position={[0, 5.5, -11]}
        angle={0.85}
        penumbra={0.6}
        intensity={4.5}
        color="#FFF2E8"
        castShadow={false}
      />

      {/* Red architectural accent light at back wall base */}
      <pointLight position={[0, 0.4, -13.2]} intensity={4} color="#CB2957" distance={9} />

      {/* ═══════════════════════════════════════════════════════
          FLOOR — Premium polished white marble
          ═══════════════════════════════════════════════════════ */}

      {/* Main marble floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial map={floorTexture} roughness={0.04} metalness={0.14} />
      </mesh>

      {/* Subtle expansion joints — latitudinal */}
      {[-10, -6, -2, 2, 6, 10].map((z, i) => (
        <mesh key={`jz-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, z]}>
          <planeGeometry args={[ROOM_WIDTH, 0.012]} />
          <meshStandardMaterial color="#8c857b" roughness={0.3} metalness={0.7} transparent opacity={0.28} />
        </mesh>
      ))}

      {/* Subtle expansion joints — longitudinal */}
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <mesh key={`jx-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.002, 0]}>
          <planeGeometry args={[0.012, ROOM_DEPTH]} />
          <meshStandardMaterial color="#8c857b" roughness={0.3} metalness={0.7} transparent opacity={0.28} />
        </mesh>
      ))}

      {/* ═══════════════════════════════════════════════════════
          CEILING — Dramatic architectural ceiling
          ═══════════════════════════════════════════════════════ */}

      {/* Main ceiling — warm white */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#f0eeeb" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Recessed central tray ceiling (drops 5cm, darker tone for depth) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT - 0.06, 0]}>
        <planeGeometry args={[9, ROOM_DEPTH - 5]} />
        <meshStandardMaterial color="#e2dfd9" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Structural longitudinal ceiling beams */}
      {[-9, -3, 3, 9].map((pos, i) => (
        <group key={`beam-${i}`} position={[pos, ROOM_HEIGHT, 0]}>
          <mesh position={[0, -0.2, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.42, 0.4, ROOM_DEPTH]} />
            <meshStandardMaterial color="#dbd8d2" roughness={0.78} />
          </mesh>
          {/* Shadow gap at beam base */}
          <mesh position={[0, -0.02, 0]}>
            <boxGeometry args={[0.46, 0.025, ROOM_DEPTH]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Cross beams for architectural depth */}
      {[-10, -4, 2, 8].map((z, i) => (
        <mesh key={`xbeam-${i}`} position={[0, ROOM_HEIGHT - 0.2, z]} castShadow>
          <boxGeometry args={[ROOM_WIDTH, 0.26, 0.3]} />
          <meshStandardMaterial color="#d4d0ca" roughness={0.82} />
        </mesh>
      ))}

      {/* Wide warm LED strips under beams */}
      {[-9, -3, 3, 9].map((pos, i) => (
        <mesh key={`led-${i}`} position={[pos, ROOM_HEIGHT - 0.42, 0]}>
          <boxGeometry args={[0.14, 0.012, ROOM_DEPTH - 4]} />
          <meshStandardMaterial
            color="#FFF8F0"
            emissive="#FFF8F0"
            emissiveIntensity={3.5}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Red ceiling accent strips — segmented into bays between cross-beams
           Cross-beams are at Z = -10, -4, 2, 8. Room runs Z = -14 to +14.
           Bay centres and lengths: [-12, 5.8] [-7, 5.8] [-1, 5.8] [5, 5.8] [11, 5.8] */}
      {([-12, -7, -1, 5, 11] as number[]).map((bz, i) => (
        <group key={`redstrip-${i}`}>
          <mesh position={[-4.6, ROOM_HEIGHT - 0.025, bz]}>
            <boxGeometry args={[0.055, 0.012, 5.6]} />
            <meshStandardMaterial
              color="#CB2957"
              emissive="#CB2957"
              emissiveIntensity={2.6}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[4.6, ROOM_HEIGHT - 0.025, bz]}>
            <boxGeometry args={[0.055, 0.012, 5.6]} />
            <meshStandardMaterial
              color="#CB2957"
              emissive="#CB2957"
              emissiveIntensity={2.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* ═══════════════════════════════════════════════════════
          BACK FEATURE WALL (Z = -14) — SMK TELKOM IDENTITY WALL
          ═══════════════════════════════════════════════════════ */}

      {/* Dark charcoal base wall */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]} receiveShadow userData={{ obstacle: true }}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#0c0c0c" roughness={0.96} />
      </mesh>

      {/* Large red architectural hero panel */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2 + 0.07]} castShadow userData={{ obstacle: true }}>
        <boxGeometry args={[14.2, ROOM_HEIGHT - 0.5, 0.1]} />
        <meshStandardMaterial color="#CB2957" roughness={0.5} metalness={0.12} />
      </mesh>

      {/* White concrete branding panel (sits on top of red) */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2 + 0.14]} castShadow userData={{ obstacle: true }}>
        <boxGeometry args={[12.4, ROOM_HEIGHT - 1.4, 0.04]} />
        <meshStandardMaterial color="#EEEEEE" roughness={0.82} />
      </mesh>

      {/* Red LED strip — top of red panel */}
      <mesh position={[0, ROOM_HEIGHT - 0.32, -ROOM_DEPTH / 2 + 0.2]}>
        <boxGeometry args={[14.2, 0.055, 0.02]} />
        <meshStandardMaterial
          color="#CB2957"
          emissive="#CB2957"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>

      {/* Red LED strip — bottom of red panel */}
      <mesh position={[0, 0.11, -ROOM_DEPTH / 2 + 0.2]}>
        <boxGeometry args={[14.2, 0.055, 0.02]} />
        <meshStandardMaterial
          color="#CB2957"
          emissive="#CB2957"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>



      {/* ── Back Wall Branding Typography ── */}
      <Suspense fallback={null}>
        {/* Main school name — monumental */}
        <Text
          position={[0, 4.2, -ROOM_DEPTH / 2 + 0.22]}
          fontSize={0.74}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          SMK TELKOM SIDOARJO
        </Text>

        {/* Tagline in red */}
        <Text
          position={[0, 3.34, -ROOM_DEPTH / 2 + 0.22]}
          fontSize={0.21}
          color="#CB2957"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.22}
        >
          KNOWLEDGE · SKILL · CHARACTER
        </Text>

        {/* Visi label */}
        <Text
          position={[-3.0, 1.86, -ROOM_DEPTH / 2 + 0.22]}
          fontSize={0.145}
          color="#CB2957"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.07}
        >
          VISI
        </Text>

        {/* Visi content */}
        <Text
          position={[-3.0, 1.28, -ROOM_DEPTH / 2 + 0.22]}
          fontSize={0.092}
          color="#111111"
          anchorX="center"
          anchorY="middle"
          maxWidth={5.0}
          textAlign="center"
        >
          {"Menjadi sekolah unggulan teknologi\ninformasi berkarakter dan berdaya saing global."}
        </Text>

        {/* Misi label */}
        <Text
          position={[3.0, 1.86, -ROOM_DEPTH / 2 + 0.22]}
          fontSize={0.145}
          color="#CB2957"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.07}
        >
          MISI
        </Text>

        {/* Misi content */}
        <Text
          position={[3.0, 1.28, -ROOM_DEPTH / 2 + 0.22]}
          fontSize={0.088}
          color="#111111"
          anchorX="center"
          anchorY="middle"
          maxWidth={5.0}
          textAlign="center"
        >
          {"Pendidikan IT berkualitas tinggi\nAkhlak mulia & budaya gotong royong\nKemitraan industri nasional & global"}
        </Text>
      </Suspense>

      {/* ═══════════════════════════════════════════════════════
          FRONT WALL (Z = +14) — Entry Accent Wall
          ═══════════════════════════════════════════════════════ */}

      {/* White concrete base */}
      <mesh position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]} rotation={[0, Math.PI, 0]} receiveShadow userData={{ obstacle: true }}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#000000" roughness={0.88} />
      </mesh>

      {/* Slatted oak screen removed per user request */}

      {/* Red LED baseboard strip on front wall */}
      <mesh position={[0, 0.05, ROOM_DEPTH / 2 - 0.05]}>
        <boxGeometry args={[ROOM_WIDTH, 0.055, 0.02]} />
        <meshStandardMaterial
          color="#CB2957"
          emissive="#CB2957"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>

      {/* ═══════════════════════════════════════════════════════
          BASEBOARDS — Brushed black aluminum trim
          ═══════════════════════════════════════════════════════ */}
      <mesh position={[0, 0.05, -ROOM_DEPTH / 2 + 0.02]} userData={{ obstacle: true }}>
        <boxGeometry args={[ROOM_WIDTH, 0.1, 0.04]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.65} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.05, ROOM_DEPTH / 2 - 0.02]} userData={{ obstacle: true }}>
        <boxGeometry args={[ROOM_WIDTH, 0.1, 0.04]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.65} metalness={0.3} />
      </mesh>
      <mesh position={[-ROOM_WIDTH / 2 + 0.02, 0.05, 0]} userData={{ obstacle: true }}>
        <boxGeometry args={[0.04, 0.1, ROOM_DEPTH]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.65} metalness={0.3} />
      </mesh>
      <mesh position={[ROOM_WIDTH / 2 - 0.02, 0.05, 0]} userData={{ obstacle: true }}>
        <boxGeometry args={[0.04, 0.1, ROOM_DEPTH]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.65} metalness={0.3} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════
          LEFT SIDE WALL — Premium Timeless Design
          ═══════════════════════════════════════════════════════ */}

      {/* Base warm white wall */}
      <mesh
        position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
        userData={{ obstacle: true }}
      >
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#F7F6F3" roughness={0.95} />
      </mesh>

      {/* Zone 1 - SEJARAH */}
      <group position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -10]}>
        {/* Recessed niche - light ivory (recessed into wall) */}
        <mesh
          position={[-0.06, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.12, 3.4, 4.2]} />
          <meshStandardMaterial color="#F3F0EB" roughness={0.95} />
        </mesh>
        {/* Section header typography (inside recess) */}
        <Suspense fallback={null}>
          <Text
            position={[-0.02, 1.45, 0]}
            fontSize={0.36}
            color="#303030"
            anchorX="center"
            anchorY="middle"
            rotation={[0, Math.PI / 2, 0]}
            letterSpacing={0.35}
          >
            SEJARAH
          </Text>
          {/* Telkom Red underline */}
          <mesh
            position={[-0.02, 1.2, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.015, 0.01, 1.2]} />
            <meshStandardMaterial color="#D62B4D" />
          </mesh>
        </Suspense>
      </group>

      {/* Zone 2 - TATA TERTIB */}
      <group position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -5]}>
        <mesh
          position={[-0.06, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.12, 3.4, 4.2]} />
          <meshStandardMaterial color="#F3F0EB" roughness={0.95} />
        </mesh>
        <Suspense fallback={null}>
          <Text
            position={[-0.02, 1.45, 0]}
            fontSize={0.36}
            color="#303030"
            anchorX="center"
            anchorY="middle"
            rotation={[0, Math.PI / 2, 0]}
            letterSpacing={0.35}
          >
            TATA TERTIB
          </Text>
          <mesh
            position={[-0.02, 1.2, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.015, 0.01, 1.6]} />
            <meshStandardMaterial color="#D62B4D" />
          </mesh>
        </Suspense>
      </group>

      {/* Zone 3 - PRESTASI */}
      <group position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <mesh
          position={[-0.06, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.12, 3.4, 4.2]} />
          <meshStandardMaterial color="#F3F0EB" roughness={0.95} />
        </mesh>
        <Suspense fallback={null}>
          <Text
            position={[-0.02, 1.45, 0]}
            fontSize={0.36}
            color="#303030"
            anchorX="center"
            anchorY="middle"
            rotation={[0, Math.PI / 2, 0]}
            letterSpacing={0.35}
          >
            PRESTASI
          </Text>
          <mesh
            position={[-0.02, 1.2, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.015, 0.01, 1.4]} />
            <meshStandardMaterial color="#D62B4D" />
          </mesh>
        </Suspense>
      </group>

      {/* Zone 4 - BUDAYA */}
      <group position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 5]}>
        <mesh
          position={[-0.06, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.12, 3.4, 4.2]} />
          <meshStandardMaterial color="#F3F0EB" roughness={0.95} />
        </mesh>
        <Suspense fallback={null}>
          <Text
            position={[-0.02, 1.45, 0]}
            fontSize={0.36}
            color="#303030"
            anchorX="center"
            anchorY="middle"
            rotation={[0, Math.PI / 2, 0]}
            letterSpacing={0.35}
          >
            BUDAYA
          </Text>
          <mesh
            position={[-0.02, 1.2, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.015, 0.01, 1.2]} />
            <meshStandardMaterial color="#D62B4D" />
          </mesh>
        </Suspense>
      </group>

      {/* Zone 5 - INOVASI */}
      <group position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 10]}>
        <mesh
          position={[-0.06, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.12, 3.4, 4.2]} />
          <meshStandardMaterial color="#F3F0EB" roughness={0.95} />
        </mesh>
        <Suspense fallback={null}>
          <Text
            position={[-0.02, 1.45, 0]}
            fontSize={0.36}
            color="#303030"
            anchorX="center"
            anchorY="middle"
            rotation={[0, Math.PI / 2, 0]}
            letterSpacing={0.35}
          >
            INOVASI
          </Text>
          <mesh
            position={[-0.02, 1.2, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.015, 0.01, 1.3]} />
            <meshStandardMaterial color="#D62B4D" />
          </mesh>
        </Suspense>
      </group>

      {/* Subtle vertical grooves between sections */}
      {[-12.5, -7.5, -2.5, 2.5, 7.5, 12.5].map((z, i) => (
        <mesh
          key={`left-groove-${i}`}
          position={[-ROOM_WIDTH / 2 + 0.01, ROOM_HEIGHT / 2, z]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <boxGeometry args={[0.008, ROOM_HEIGHT, 0.03]} />
          <meshStandardMaterial color="#DDD8D2" roughness={0.95} />
        </mesh>
      ))}

      {/* ═══════════════════════════════════════════════════════
          RIGHT SIDE WALL — Premium Timeless Design (Symmetrical)
          ═══════════════════════════════════════════════════════ */}

      {/* Base warm white wall */}
      <mesh
        position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
        userData={{ obstacle: true }}
      >
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#F7F6F3" roughness={0.95} />
      </mesh>

      {/* Zone 1 - LINI MASA */}
      <group position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -10]}>
        <mesh
          position={[0.06, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.12, 3.4, 4.2]} />
          <meshStandardMaterial color="#F3F0EB" roughness={0.95} />
        </mesh>
        <Suspense fallback={null}>
          <Text
            position={[0.02, 1.45, 0]}
            fontSize={0.36}
            color="#303030"
            anchorX="center"
            anchorY="middle"
            rotation={[0, -Math.PI / 2, 0]}
            letterSpacing={0.35}
          >
            LINI MASA
          </Text>
          <mesh
            position={[0.02, 1.2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.015, 0.01, 1.4]} />
            <meshStandardMaterial color="#D62B4D" />
          </mesh>
        </Suspense>
      </group>

      {/* Zone 2 - KOMPETENSI */}
      <group position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -5]}>
        <mesh
          position={[0.06, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.12, 3.4, 4.2]} />
          <meshStandardMaterial color="#F3F0EB" roughness={0.95} />
        </mesh>
        <Suspense fallback={null}>
          <Text
            position={[0.02, 1.45, 0]}
            fontSize={0.36}
            color="#303030"
            anchorX="center"
            anchorY="middle"
            rotation={[0, -Math.PI / 2, 0]}
            letterSpacing={0.35}
          >
            KOMPETENSI
          </Text>
          <mesh
            position={[0.02, 1.2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.015, 0.01, 1.7]} />
            <meshStandardMaterial color="#D62B4D" />
          </mesh>
        </Suspense>
      </group>

      {/* Zone 3 - PENGHARGAAN */}
      <group position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <mesh
          position={[0.06, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.12, 3.4, 4.2]} />
          <meshStandardMaterial color="#F3F0EB" roughness={0.95} />
        </mesh>
        <Suspense fallback={null}>
          <Text
            position={[0.02, 1.45, 0]}
            fontSize={0.36}
            color="#303030"
            anchorX="center"
            anchorY="middle"
            rotation={[0, -Math.PI / 2, 0]}
            letterSpacing={0.35}
          >
            PENGHARGAAN
          </Text>
          <mesh
            position={[0.02, 1.2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.015, 0.01, 1.8]} />
            <meshStandardMaterial color="#D62B4D" />
          </mesh>
        </Suspense>
      </group>

      {/* Zone 4 - KARAKTER */}
      <group position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 5]}>
        <mesh
          position={[0.06, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.12, 3.4, 4.2]} />
          <meshStandardMaterial color="#F3F0EB" roughness={0.95} />
        </mesh>
        <Suspense fallback={null}>
          <Text
            position={[0.02, 1.45, 0]}
            fontSize={0.36}
            color="#303030"
            anchorX="center"
            anchorY="middle"
            rotation={[0, -Math.PI / 2, 0]}
            letterSpacing={0.35}
          >
            KARAKTER
          </Text>
          <mesh
            position={[0.02, 1.2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.015, 0.01, 1.5]} />
            <meshStandardMaterial color="#D62B4D" />
          </mesh>
        </Suspense>
      </group>

      {/* Zone 5 - TEKNOLOGI */}
      <group position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 10]}>
        <mesh
          position={[0.06, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.12, 3.4, 4.2]} />
          <meshStandardMaterial color="#F3F0EB" roughness={0.95} />
        </mesh>
        <Suspense fallback={null}>
          <Text
            position={[0.02, 1.45, 0]}
            fontSize={0.36}
            color="#303030"
            anchorX="center"
            anchorY="middle"
            rotation={[0, -Math.PI / 2, 0]}
            letterSpacing={0.35}
          >
            TEKNOLOGI
          </Text>
          <mesh
            position={[0.02, 1.2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.015, 0.01, 1.8]} />
            <meshStandardMaterial color="#D62B4D" />
          </mesh>
        </Suspense>
      </group>

      {/* Subtle vertical grooves between sections */}
      {[-12.5, -7.5, -2.5, 2.5, 7.5, 12.5].map((z, i) => (
        <mesh
          key={`right-groove-${i}`}
          position={[ROOM_WIDTH / 2 - 0.01, ROOM_HEIGHT / 2, z]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <boxGeometry args={[0.008, ROOM_HEIGHT, 0.03]} />
          <meshStandardMaterial color="#DDD8D2" roughness={0.95} />
        </mesh>
      ))}



      {/* ═══════════════════════════════════════════════════════
          GRAND LOBBY CENTERPIECE
          ═══════════════════════════════════════════════════════ */}
      <group position={[0, 0, -2]}>
        {/* Outer large red wayfinding floor ring */}
        <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.032, 8, 64]} />
          <meshStandardMaterial
            color="#CB2957"
            emissive="#CB2957"
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>

        {/* Inner secondary ring */}
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.7, 0.015, 8, 64]} />
          <meshStandardMaterial
            color="#CB2957"
            emissive="#CB2957"
            emissiveIntensity={1.0}
            toneMapped={false}
          />
        </mesh>

        {/* Double-tiered plinth */}
        <mesh receiveShadow castShadow position={[0, 0.05, 0]} userData={{ obstacle: true }}>
          <cylinderGeometry args={[1.5, 1.62, 0.1, 40]} />
          <meshStandardMaterial color="#121212" roughness={0.72} />
        </mesh>
        <mesh receiveShadow castShadow position={[0, 0.17, 0]} userData={{ obstacle: true }}>
          <cylinderGeometry args={[1.32, 1.32, 0.14, 40]} />
          <meshStandardMaterial color="#f2f0ee" roughness={0.18} metalness={0.06} />
        </mesh>

        {/* Emissive red ring on plinth edge */}
        <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.3, 0.022, 8, 64]} />
          <meshStandardMaterial
            color="#CB2957"
            emissive="#CB2957"
            emissiveIntensity={2.0}
            toneMapped={false}
          />
        </mesh>

        {/* ─── Premium 3-D Logo Centerpiece ─────────────────────── */}
        <LogoCenterpiece />
      </group>





      {/* ═══════════════════════════════════════════════════════
          INTERACTIVE EXHIBITS
          ═══════════════════════════════════════════════════════ */}
      {museumData.map((item) => (
        <ExhibitObject key={item.id} item={item} />
      ))}

      {/* ═══════════════════════════════════════════════════════
          PREMIUM MUSEUM FURNITURE
          ═══════════════════════════════════════════════════════ */}

      {/* Central Seating Area: 4 Symmetric Premium Benches Around Orb */}
      {[
        { pos: [0, 0, -2 - 3] as [number, number, number], rot: 0 },         // North Bench (Z minus 3, facing south/Orb)
        { pos: [0 + 3, 0, -2] as [number, number, number], rot: -Math.PI / 2 },  // East Bench (X plus 3, facing west/Orb)
        { pos: [0, 0, -2 + 3] as [number, number, number], rot: Math.PI },    // South Bench (Z plus 3, facing north/Orb)
        { pos: [0 - 3, 0, -2] as [number, number, number], rot: Math.PI / 2 },   // West Bench (X minus 3, facing east/Orb)
      ].map(({ pos, rot }, i) => (
        <group key={`central-bench-${i}`} position={pos} rotation={[0, rot, 0]}>
          {/* Light Oak Seat (Slim, Floating Look) */}
          <mesh position={[0, 0.25, 0]} receiveShadow castShadow userData={{ obstacle: true }}>
            <boxGeometry args={[2.0, 0.1, 0.45]} />
            <meshStandardMaterial color="#d4b896" roughness={0.7} />
          </mesh>
          {/* Matte Black Steel Legs (Minimal, Slim) */}
          {[-0.85, 0.85].map((x, j) => (
            <mesh key={`leg-${j}`} position={[x, 0.1, 0]} castShadow receiveShadow userData={{ obstacle: true }}>
              <boxGeometry args={[0.07, 0.2, 0.07]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Subtle Brass Floor Inlay for Central Area */}
      <mesh position={[0, 0.004, -2]} rotation={[-Math.PI/2, 0, 0]}>
        <torusGeometry args={[3.5, 0.025, 8, 128]} />
        <meshStandardMaterial color="#d4a058" roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  );
}
