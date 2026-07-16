"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Penghitung FPS ringan berbasis requestAnimationFrame.
 * Ditampilkan di pojok saat "Show FPS Counter" aktif.
 */
export default function FpsCounter() {
  const [fps, setFps] = useState(0);
  const frames = useRef(0);
  const last = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    last.current = performance.now();
    const loop = () => {
      frames.current += 1;
      const now = performance.now();
      const elapsed = now - last.current;
      if (elapsed >= 500) {
        setFps(Math.round((frames.current * 1000) / elapsed));
        frames.current = 0;
        last.current = now;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const color = fps >= 50 ? "#4ade80" : fps >= 30 ? "#facc15" : "#f87171";

  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        left: 14,
        zIndex: 50,
        pointerEvents: "none",
        padding: "5px 10px",
        borderRadius: 8,
        background: "rgba(15,23,42,0.6)",
        border: "1px solid rgba(148,163,184,0.2)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        fontFamily: "var(--font-geist-mono), monospace",
        fontSize: 12,
        fontWeight: 600,
        color,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {fps} FPS
    </div>
  );
}
