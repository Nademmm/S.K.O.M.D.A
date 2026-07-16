"use client";

import { useEffect, useState, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { interactionState } from "@/interaction/InteractionStore";
import { museumData } from "@/utils/museumData";

/**
 * 3D Debug Visualizers — Toggled via F3 or Tilde (`~`).
 * Renders in-editor helpers inside the Three.js Canvas:
 *   1. Interaction radius rings around pedestals (green if within limits, red if too far)
 *   2. Raycast laser pointer showing the direction of the center Raycaster
 */
export default function DebugHelper3D() {
  const [enabled, setEnabled] = useState(false);
  const { camera } = useThree();

  const laserGeomRef = useRef<THREE.BufferGeometry>(null);
  const points = useRef([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -10)]);

  // Toggle debug helpers on same F3 keydown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F3" || e.key === "`" || e.key === "~") {
        setEnabled((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update laser vector every frame
  useFrame(() => {
    if (!enabled || !laserGeomRef.current) return;

    // Line start at camera position slightly offset down
    const start = camera.position.clone().add(
      new THREE.Vector3(0, -0.2, 0).applyQuaternion(camera.quaternion)
    );

    // Line end goes camera direction * max distance
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const end = start.clone().addScaledVector(dir, 3.5);

    points.current[0].copy(start);
    points.current[1].copy(end);

    laserGeomRef.current.setFromPoints(points.current);
  });

  if (!enabled) return null;

  return (
    <group>
      {/* ── Center Raycast Laser Line ── */}
      <line>
        <bufferGeometry ref={laserGeomRef} />
        <lineBasicMaterial color={interactionState.canInteract ? "#00ff66" : "#ff3366"} linewidth={2} />
      </line>

      {/* ── Interaction Boundary Circles Around Pedestals ── */}
      {museumData.map((item) => {
        const isHovered = interactionState.hoveredId === item.id;
        const color = isHovered
          ? interactionState.canInteract
            ? "#00ff66" // active/in range
            : "#ff9900" // hovered but out of range
          : "#333333"; // idle

        return (
          <group key={`debug-${item.id}`} position={item.position}>
            {/* Draw a circular line on the floor showing the interaction boundary */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <ringGeometry args={[3.48, 3.52, 32]} />
              <meshBasicMaterial color={color} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
