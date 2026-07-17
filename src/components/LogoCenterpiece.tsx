"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Floating Logo Body ────────────────────────────────────────────────────────

/**
 * Replicates the SMK Telkom Sidoarjo logo silhouette in 3D using
 * extruded procedural geometry:
 *
 *   ┌── Red upper section ──┐   ← Open-book / wing shape (two arched lobes)
 *   └── Gray lower section ─┘   ← Two cylindrical letter forms (TS)
 *
 * All shapes are built from Three.js primitives and custom ExtrudeGeometry
 * to get smooth beveled surfaces without external assets.
 */

// ── Helper: create a smooth arc "wing" shape ───────────────────────────────

function makeWingShape(side: "left" | "right"): THREE.Shape {
  const s = new THREE.Shape();
  const sign = side === "left" ? -1 : 1;

  // Wing: a broad arc that sweeps upward then curves back in
  // Coordinates in local 2-D space (Y = up, X = right)
  const ox = sign * 0.08; // slight inward offset at center notch

  s.moveTo(ox, 0);
  s.bezierCurveTo(
    sign * 0.05,  0.35,
    sign * 0.6,   0.7,
    sign * 0.72,  0.72
  );
  s.bezierCurveTo(
    sign * 0.82,  0.72,
    sign * 0.90,  0.62,
    sign * 0.86,  0.45
  );
  s.bezierCurveTo(
    sign * 0.8,   0.2,
    sign * 0.4,   0.12,
    ox,           0
  );
  s.closePath();
  return s;
}

// ── Helper: create the gray "T" letter body ───────────────────────────────

function makeTShape(): THREE.Shape {
  const s = new THREE.Shape();
  // Outer profile of a bold rounded "T"
  s.moveTo(-0.40, 0);
  s.lineTo(-0.40, 0.56);
  s.lineTo(-0.19, 0.56);
  s.lineTo(-0.19, 0.72);
  s.lineTo( 0.19, 0.72);
  s.lineTo( 0.19, 0.56);
  s.lineTo( 0.40, 0.56);
  s.lineTo( 0.40, 0);
  s.closePath();
  return s;
}

// ── Helper: create the gray "S" letter body ───────────────────────────────

function makeSShape(): THREE.Shape {
  // Built as a pair of arcs approximating a bold "S"
  const s = new THREE.Shape();
  const pts: [number, number][] = [
    [ 0.22, 0.00],
    [ 0.35, 0.05],
    [ 0.38, 0.16],
    [ 0.28, 0.30],
    [ 0.05, 0.36],
    [-0.20, 0.42],
    [-0.35, 0.56],
    [-0.22, 0.70],
    [-0.05, 0.74],
    [ 0.20, 0.68],
    [ 0.36, 0.56],
    [ 0.20, 0.56],
    [ 0.10, 0.62],
    [-0.06, 0.64],
    [-0.16, 0.57],
    [-0.04, 0.48],
    [ 0.22, 0.42],
    [ 0.40, 0.28],
    [ 0.36, 0.12],
    [ 0.22, 0.00],
  ];
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
}

// ── Extrude settings ─────────────────────────────────────────────────────────

const EXTRUDE_OPTS: THREE.ExtrudeGeometryOptions = {
  depth: 0.22,
  bevelEnabled: true,
  bevelThickness: 0.025,
  bevelSize: 0.022,
  bevelSegments: 6,
  curveSegments: 32,
};

// ─── Particle System ──────────────────────────────────────────────────────────

function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 80;

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const ph  = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      // Distribute in a cylinder around the logo
      const angle  = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 1.2;
      pos[i * 3]     = Math.cos(angle) * radius;
      pos[i * 3 + 1] = -0.5 + Math.random() * 3.0;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] = positions[i * 3 + 1] + Math.sin(t * 0.4 + phases[i]) * 0.12;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(positions), 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#88d8ff"
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Holographic Ground Projector ─────────────────────────────────────────────

function HolographicProjector() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const glyphRef = useRef<THREE.Mesh>(null);
  const scanRef  = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1Ref.current) ring1Ref.current.rotation.z =  t * 0.35;
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.55;
    if (ring3Ref.current) ring3Ref.current.rotation.z =  t * 0.20;
    if (glyphRef.current) glyphRef.current.rotation.z =  t * 0.18;
    // Scanning pulse
    if (scanRef.current) {
      const pulse = (Math.sin(t * 1.6) + 1) / 2;
      (scanRef.current.material as THREE.MeshStandardMaterial).opacity = pulse * 0.18 + 0.04;
    }
  });

  return (
    <group position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Outer glow disc */}
      <mesh>
        <circleGeometry args={[1.8, 64]} />
        <meshStandardMaterial
          color="#0a4fff"
          emissive="#0a4fff"
          emissiveIntensity={0.18}
          transparent
          opacity={0.09}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Concentric energy rings */}
      {[0.55, 0.90, 1.28, 1.62].map((r, i) => (
        <mesh key={i}>
          <torusGeometry args={[r, 0.008, 6, 128]} />
          <meshStandardMaterial
            color="#22aaff"
            emissive="#22aaff"
            emissiveIntensity={1.4 - i * 0.25}
            transparent
            opacity={0.55 - i * 0.08}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Rotating outer ring with dashes */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.72, 0.012, 6, 48, Math.PI * 1.6]} />
        <meshStandardMaterial
          color="#44ccff"
          emissive="#44ccff"
          emissiveIntensity={2.0}
          transparent
          opacity={0.8}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Rotating inner dashed ring */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.05, 0.009, 6, 36, Math.PI * 1.2]} />
        <meshStandardMaterial
          color="#66ddff"
          emissive="#66ddff"
          emissiveIntensity={1.6}
          transparent
          opacity={0.65}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Medium rotating ring */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.38, 0.006, 6, 48, Math.PI * 0.9]} />
        <meshStandardMaterial
          color="#aaeeff"
          emissive="#aaeeff"
          emissiveIntensity={1.2}
          transparent
          opacity={0.5}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Rotating glyph pattern (six-pointed) */}
      <mesh ref={glyphRef}>
        <torusGeometry args={[0.68, 0.018, 6, 6]} />
        <meshStandardMaterial
          color="#22ddff"
          emissive="#22ddff"
          emissiveIntensity={1.8}
          transparent
          opacity={0.7}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Digital scan pulse overlay */}
      <mesh ref={scanRef}>
        <circleGeometry args={[1.75, 64]} />
        <meshStandardMaterial
          color="#22aaff"
          emissive="#22aaff"
          emissiveIntensity={1.0}
          transparent
          opacity={0.1}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Center core dot */}
      <mesh>
        <circleGeometry args={[0.08, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#88ddff"
          emissiveIntensity={3.0}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ─── Light Beam Column ────────────────────────────────────────────────────────

function LightBeam() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    (ref.current.material as THREE.MeshStandardMaterial).opacity =
      0.04 + Math.sin(t * 0.8) * 0.015;
  });

  return (
    <mesh ref={ref} position={[0, 1.5, 0]}>
      <cylinderGeometry args={[0.18, 1.1, 3.0, 32, 1, true]} />
      <meshStandardMaterial
        color="#aae8ff"
        emissive="#aae8ff"
        emissiveIntensity={0.6}
        transparent
        opacity={0.055}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Floor Reflection Disc ────────────────────────────────────────────────────

function FloorReflection() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    (ref.current.material as THREE.MeshStandardMaterial).opacity =
      0.12 + Math.sin(t * 0.5) * 0.04;
  });

  return (
    <mesh ref={ref} position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.75, 48]} />
      <meshStandardMaterial
        color="#cc2244"
        emissive="#cc2244"
        emissiveIntensity={0.3}
        transparent
        opacity={0.14}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Main Logo Geometry ───────────────────────────────────────────────────────

function LogoGeometry() {
  const groupRef = useRef<THREE.Group>(null);

  // Pre-build all shapes once
  const wingL = useMemo(() => new THREE.ExtrudeGeometry(makeWingShape("left"),  EXTRUDE_OPTS), []);
  const wingR = useMemo(() => new THREE.ExtrudeGeometry(makeWingShape("right"), EXTRUDE_OPTS), []);
  const tGeo  = useMemo(() => new THREE.ExtrudeGeometry(makeTShape(), EXTRUDE_OPTS), []);
  const sGeo  = useMemo(() => new THREE.ExtrudeGeometry(makeSShape(), EXTRUDE_OPTS), []);

  // Center each geometry
  useMemo(() => {
    [wingL, wingR, tGeo, sGeo].forEach(g => g.center());
  }, [wingL, wingR, tGeo, sGeo]);

  // Floating + rotation + breathing animation
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = 0.95 + Math.sin(t * 0.55) * 0.06;
    groupRef.current.rotation.y = t * 0.065;
    const breathe = 1 + Math.sin(t * 1.1) * 0.008;
    groupRef.current.scale.setScalar(breathe);
  });

  return (
    <group ref={groupRef} position={[0, 0.95, 0]}>
      {/* ── Red upper wings ── */}
      {/* Left wing */}
      <mesh geometry={wingL} position={[-0.48, 0.52, 0]} castShadow>
        <meshPhysicalMaterial
          color="#cc1133"
          emissive="#7f0010"
          emissiveIntensity={0.35}
          roughness={0.08}
          metalness={0.1}
          transmission={0.28}
          thickness={0.4}
          ior={1.45}
          reflectivity={0.85}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* Right wing */}
      <mesh geometry={wingR} position={[0.48, 0.52, 0]} castShadow>
        <meshPhysicalMaterial
          color="#cc1133"
          emissive="#7f0010"
          emissiveIntensity={0.35}
          roughness={0.08}
          metalness={0.1}
          transmission={0.28}
          thickness={0.4}
          ior={1.45}
          reflectivity={0.85}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Internal glow core between wings */}
      <mesh position={[0, 0.62, 0.06]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
          color="#ff8899"
          emissive="#ff2244"
          emissiveIntensity={1.8}
          toneMapped={false}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* ── Gray lower letter forms (T on left, S on right) ── */}
      {/* T letter */}
      <mesh geometry={tGeo} position={[-0.50, -0.22, 0]} castShadow>
        <meshPhysicalMaterial
          color="#7a7a7e"
          roughness={0.22}
          metalness={0.72}
          reflectivity={0.9}
          clearcoat={0.6}
          clearcoatRoughness={0.12}
        />
      </mesh>
      {/* S letter */}
      <mesh geometry={sGeo} position={[0.50, -0.22, 0]} castShadow>
        <meshPhysicalMaterial
          color="#7a7a7e"
          roughness={0.22}
          metalness={0.72}
          reflectivity={0.9}
          clearcoat={0.6}
          clearcoatRoughness={0.12}
        />
      </mesh>

      {/* Subtle rim light highlight strip between red and gray */}
      <mesh position={[0, 0.14, 0.15]}>
        <boxGeometry args={[1.1, 0.018, 0.01]} />
        <meshStandardMaterial
          color="#aaddff"
          emissive="#aaddff"
          emissiveIntensity={1.8}
          toneMapped={false}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

// ─── Full Centerpiece Export ──────────────────────────────────────────────────

export default function LogoCenterpiece() {
  return (
    <group>
      {/* Holographic ground projector */}
      <HolographicProjector />

      {/* Floor reflection */}
      <FloorReflection />

      {/* Volumetric light beam column */}
      <LightBeam />

      {/* Floating particles cloud */}
      <FloatingParticles />

      {/* ── The logo itself ── */}
      <LogoGeometry />

      {/* ── Dynamic lighting for the logo ── */}
      {/* Main white spotlight from above */}
      <spotLight
        position={[0, 5.5, 0]}
        angle={0.22}
        penumbra={0.6}
        intensity={18}
        color="#ffffff"
        castShadow={false}
      />
      {/* Soft red fill underneath */}
      <pointLight position={[0, 0.35, 0]} intensity={2.5} distance={4} color="#CC1133" />
      {/* Blue-white rim light from behind */}
      <pointLight position={[0, 1.8, -1.2]} intensity={3.5} distance={5} color="#88ccff" />
      {/* Warm key fill */}
      <pointLight position={[1.5, 2.2, 0.8]} intensity={2.0} distance={4} color="#fff5ee" />
    </group>
  );
}
