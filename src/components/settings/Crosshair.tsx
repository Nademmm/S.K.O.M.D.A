"use client";

import type { CrosshairStyle } from "@/settings/settingsConfig";

interface CrosshairProps {
  style: CrosshairStyle;
  /** Warna crosshair (mengikuti aksen atau high-contrast). */
  color?: string;
}

/**
 * Crosshair yang dirender procedural (tanpa asset) sesuai gaya terpilih.
 * "none" tidak menampilkan apa pun.
 */
export default function Crosshair({ style, color = "rgba(255,255,255,0.85)" }: CrosshairProps) {
  if (style === "none") return null;

  const wrapper: React.CSSProperties = {
    pointerEvents: "none",
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 25,
  };

  if (style === "dot") {
    return (
      <div
        style={{
          ...wrapper,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          boxShadow: "0 0 6px rgba(0,0,0,0.6)",
        }}
      />
    );
  }

  if (style === "circle") {
    return (
      <div
        style={{
          ...wrapper,
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: `2px solid ${color}`,
          boxShadow: "0 0 6px rgba(0,0,0,0.6)",
        }}
      />
    );
  }

  // style === "cross"
  const bar: React.CSSProperties = {
    position: "absolute",
    background: color,
    boxShadow: "0 0 4px rgba(0,0,0,0.6)",
  };
  return (
    <div style={{ ...wrapper, width: 20, height: 20 }}>
      <span style={{ ...bar, left: "50%", top: 0, width: 2, height: "100%", transform: "translateX(-50%)" }} />
      <span style={{ ...bar, top: "50%", left: 0, height: 2, width: "100%", transform: "translateY(-50%)" }} />
    </div>
  );
}
