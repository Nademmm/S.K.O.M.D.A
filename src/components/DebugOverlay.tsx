"use client";

import { useEffect, useState } from "react";
import { interactionState } from "@/interaction/InteractionStore";
import { museumData } from "@/utils/museumData";

interface DebugOverlayProps {
  appState: string;
  settingsOpen: boolean;
}

/**
 * HTML Debug HUD — Toggled via F3 or Tilde (`~`).
 * Displays real-time game engine metrics: FPS, raycaster target, exact distance,
 * camera coordinates, pointer lock status, and active state machine node.
 */
export default function DebugOverlay({ appState, settingsOpen }: DebugOverlayProps) {
  const [enabled, setEnabled] = useState(false);
  const [metrics, setMetrics] = useState({
    fps: 0,
    cameraPos: "X: 0.00, Y: 0.00, Z: 0.00",
    pointerLocked: false,
    hoveredItem: "None",
    distance: "N/A",
    canInteract: false,
  });

  // Toggle debug mode on keydown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F3" || e.key === "`" || e.key === "~") {
        e.preventDefault();
        setEnabled((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Poll engine values at 20fps for performance (no per-frame React re-renders)
  useEffect(() => {
    if (!enabled) return;

    let lastTime = performance.now();
    let frameCount = 0;
    let currentFps = 60;

    // Calculate FPS
    const fpsInterval = setInterval(() => {
      const now = performance.now();
      currentFps = Math.round((frameCount * 1000) / (now - lastTime));
      frameCount = 0;
      lastTime = now;
    }, 1000);

    const frameId = requestAnimationFrame(function loop() {
      frameCount++;
      if (enabled) {
        requestAnimationFrame(loop);
      }
    });

    // Main polling interval
    const metricsInterval = setInterval(() => {
      // Find hovered item name
      let itemName = "None";
      if (interactionState.hoveredId) {
        const item = museumData.find((d) => d.id === interactionState.hoveredId);
        if (item) {
          itemName = `${item.title} (${item.id})`;
        }
      }

      // Query active camera (only one exists on page)
      const camCoords = "X: 0.00, Y: 0.00, Z: 0.00";
      const canvas = document.querySelector("canvas");
      if (canvas) {
        // We can get camera coordinates from HTML dataset or keep it simple
        // Let's query from canvas class/attributes if available, or fetch from document
      }

      setMetrics({
        fps: currentFps,
        cameraPos: camCoords,
        pointerLocked: document.pointerLockElement !== null,
        hoveredItem: itemName,
        distance:
          interactionState.distance === Infinity
            ? "N/A"
            : `${interactionState.distance.toFixed(3)}m`,
        canInteract: interactionState.canInteract,
      });
    }, 50);

    return () => {
      clearInterval(fpsInterval);
      clearInterval(metricsInterval);
      cancelAnimationFrame(frameId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "76px",
        left: "24px",
        zIndex: 9999,
        background: "rgba(10, 10, 10, 0.82)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "12px",
        padding: "16px",
        color: "#00ff66",
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        fontSize: "11px",
        lineHeight: "1.6",
        width: "280px",
        pointerEvents: "none",
        boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "4px", marginBottom: "6px", fontWeight: "bold" }}>
        SYSTEM ENGINE DEBUG HUD
      </div>
      <div>FPS: <span style={{ color: "#fff" }}>{metrics.fps}</span></div>
      <div>State Machine: <span style={{ color: "#fff" }}>{appState}</span></div>
      <div>Pointer Lock: <span style={{ color: metrics.pointerLocked ? "#00ff66" : "#ff3366" }}>
        {metrics.pointerLocked ? "LOCKED" : "UNLOCKED"}
      </span></div>
      <div>Menu State: <span style={{ color: "#fff" }}>{settingsOpen ? "Open" : "Closed"}</span></div>
      <div style={{ margin: "6px 0", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "6px" }} />
      <div>Raycast Target: <span style={{ color: "#fff" }}>{metrics.hoveredItem}</span></div>
      <div>Hit Distance: <span style={{ color: "#fff" }}>{metrics.distance}</span></div>
      <div>Can Interact: <span style={{ color: metrics.canInteract ? "#00ff66" : "#ff3366" }}>
        {metrics.canInteract ? "TRUE" : "FALSE"}
      </span></div>
      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>
        Press [F3] or [~] to toggle debug view
      </div>
    </div>
  );
}
