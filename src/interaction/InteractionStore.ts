/**
 * InteractionStore — module-level singleton for FPS raycast interaction state.
 *
 * WHY NOT useState?
 * This store is written every frame (60fps) by the InteractionManager's raycaster.
 * Using React setState at 60fps would cause constant re-renders throughout the
 * component tree. Instead, this plain mutable object is the single source of truth.
 * React state is updated ONLY when the hovered exhibit ID actually changes
 * (2 events per hover cycle: in and out), handled by InteractionManager.
 *
 * Architecture:
 *   useFrame (InteractionManager) → writes interactionState
 *   useFrame (ExhibitObject)      → reads interactionState for animations (no re-render)
 *   onHoverChange callback        → fires only on hover change → updates React state in parent
 */

import * as THREE from "three";

// ─── Interaction Snapshot ─────────────────────────────────────────────────────

export interface InteractionSnapshot {
  /** The exhibit ID currently under the crosshair, or null if none. */
  hoveredId: string | null;
  /** True when hoveredId is set AND within interaction distance AND unblocked. */
  canInteract: boolean;
  /** Exact world-space distance from camera to the collider hit. */
  distance: number;
}

/**
 * Live mutable state — read by ExhibitObject animations, written by InteractionManager.
 * Never triggers React re-renders directly.
 */
export const interactionState: InteractionSnapshot = {
  hoveredId: null,
  canInteract: false,
  distance: Infinity,
};

// ─── Collider Registry ────────────────────────────────────────────────────────

/**
 * Maps exhibit ID → invisible collider Mesh.
 * Only meshes in this registry are ever raycasted — nothing else in the scene
 * will cause a false positive crosshair activation.
 */
export const colliderRegistry = new Map<string, THREE.Mesh>();

/**
 * Called by ExhibitObject on mount to register its invisible collider mesh.
 * The collider is the only surface that the InteractionManager raycasts against.
 */
export function registerCollider(id: string, mesh: THREE.Mesh): void {
  colliderRegistry.set(id, mesh);
}

/**
 * Called by ExhibitObject on unmount to clean up its collider entry.
 */
export function unregisterCollider(id: string): void {
  colliderRegistry.delete(id);
}
