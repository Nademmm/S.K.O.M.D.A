"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { interactionState, colliderRegistry } from "@/interaction/InteractionStore";
import type { ExhibitItem } from "@/utils/museumData";
import { museumData } from "@/utils/museumData";

/** Maximum world-unit distance the player must be within to interact. */
const MAX_INTERACT_DISTANCE = 3.5;

// ─── Module-level raycaster and screen-center vector ─────────────────────────
// Allocated once, reused every frame — no per-frame allocations.
const _raycaster = new THREE.Raycaster();
const _screenCenter = new THREE.Vector2(0, 0); // center of NDC = center of screen

interface InteractionManagerProps {
  /**
   * Whether raycasting and key interaction are active.
   * False when player is in menus, showcasing a panel, or in cinematic mode.
   */
  enabled: boolean;
  /** Called when the player presses E on a valid target, or clicks it. */
  onInteract: (item: ExhibitItem) => void;
  /**
   * Called when the hover state changes (exhibit ↔ null).
   * Drives crosshair color and interaction prompt visibility in the React HUD.
   * Only called on actual changes, not every frame.
   */
  onHoverChange: (isHovering: boolean) => void;
}

/**
 * InteractionManager — Centralized FPS interaction system (R3F Component).
 *
 * Lives inside <Canvas> to access useFrame and useThree.
 * Renders nothing; operates entirely via side-effects.
 *
 * Responsibilities:
 *   1. Per-frame raycast from camera center → registered colliders only
 *   2. Distance check (≤ MAX_INTERACT_DISTANCE) and closest-hit selection
 *   3. Write result to `interactionState` (no React setState → no re-renders)
 *   4. Emit `onHoverChange` only on actual change (2 events per hover cycle)
 *   5. Listen for E key and trigger `onInteract` when a valid target exists
 *
 * The whitelist (colliderRegistry) ensures no wall, floor, ceiling, LED strip,
 * decoration, or hologram mesh can ever produce a false-positive crosshair.
 */
export default function InteractionManager({
  enabled,
  onInteract,
  onHoverChange,
}: InteractionManagerProps) {
  const { camera } = useThree();

  // Track previous hover ID to emit change events only (not every frame)
  const prevHoveredId = useRef<string | null>(null);

  // Stable refs to callbacks — avoids stale closure issues in useFrame/useEffect
  const onInteractRef = useRef(onInteract);
  const onHoverChangeRef = useRef(onHoverChange);

  useEffect(() => {
    onInteractRef.current = onInteract;
    onHoverChangeRef.current = onHoverChange;
  }, [onInteract, onHoverChange]);

  // ── E key: interact with hovered exhibit ─────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // ignore held key — one activation per press
      if (e.key !== "e" && e.key !== "E") return;

      const { hoveredId, canInteract } = interactionState;
      if (!hoveredId || !canInteract) return;

      const item = museumData.find((d) => d.id === hoveredId);
      if (item) onInteractRef.current(item);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // only left click
      // Only interact via click if pointer lock is already engaged
      if (document.pointerLockElement === null) return;

      const { hoveredId, canInteract } = interactionState;
      if (!hoveredId || !canInteract) return;

      const item = museumData.find((d) => d.id === hoveredId);
      if (item) onInteractRef.current(item);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [enabled]);

  // ── Per-frame raycast against whitelist ──────────────────────────────────
  useFrame(() => {
    if (!enabled) {
      // Clear state when disabled (no movement, in menus, etc.)
      if (interactionState.hoveredId !== null) {
        interactionState.hoveredId = null;
        interactionState.canInteract = false;
        interactionState.distance = Infinity;

        if (prevHoveredId.current !== null) {
          prevHoveredId.current = null;
          onHoverChangeRef.current(false);
        }
      }
      return;
    }

    // Build targets array from the collider registry (only registered exhibits)
    const targets: THREE.Mesh[] = [];
    colliderRegistry.forEach((mesh) => targets.push(mesh));

    if (targets.length === 0) return;

    // Fire raycaster from camera center (NDC 0,0 = screen center)
    _raycaster.setFromCamera(_screenCenter, camera);

    // Intersect only the whitelist — not the entire scene
    // recursive=false: each collider is a single flat mesh, no children to traverse
    const intersects = _raycaster.intersectObjects(targets, false);

    let newHoveredId: string | null = null;
    let newDistance = Infinity;

    if (intersects.length > 0) {
      const hit = intersects[0]; // closest hit (Three.js sorts ascending)
      if (hit.distance <= MAX_INTERACT_DISTANCE) {
        // Resolve which exhibit owns this collider mesh
        for (const [id, mesh] of colliderRegistry) {
          if (mesh === hit.object) {
            newHoveredId = id;
            newDistance = hit.distance;
            break;
          }
        }
      }
    }

    // Update mutable store — no React setState, no re-render
    interactionState.hoveredId = newHoveredId;
    interactionState.canInteract = newHoveredId !== null;
    interactionState.distance = newDistance;

    // Notify React UI only when hover target actually changes
    if (newHoveredId !== prevHoveredId.current) {
      prevHoveredId.current = newHoveredId;
      onHoverChangeRef.current(newHoveredId !== null);
    }
  });

  // This component renders nothing — purely a logic controller
  return null;
}
