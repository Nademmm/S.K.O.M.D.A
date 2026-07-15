"use client";

import { useState } from "react";
import styles from "./LandingOverlay.module.css";

interface LandingOverlayProps {
  onEnter: () => void;
}

/**
 * Premium landing page overlay with floating particles, animated gradient
 * title, glassmorphism instruction card, and a pulsing CTA button.
 * Fades out when the user clicks "Masuk Museum".
 */
export default function LandingOverlay({ onEnter }: LandingOverlayProps) {
  const [fadingOut, setFadingOut] = useState(false);

  const handleClick = () => {
    setFadingOut(true);
    // Wait for CSS fade-out transition before notifying parent
    setTimeout(() => onEnter(), 750);
  };

  return (
    <div className={`${styles.overlay} ${fadingOut ? styles.fadeOut : ""}`}>
      {/* Floating particles */}
      <div className={styles.particleField}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={styles.particle} />
        ))}
      </div>

      {/* Decorative rings */}
      <div className={styles.decorativeRings}>
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
      </div>

      {/* Ambient glow orbs */}
      <div className={styles.glowOrb} />
      <div className={styles.glowOrb} />
      <div className={styles.glowOrb} />

      {/* Content */}
      <div className={styles.content}>
        {/* Badge */}
        <span className={styles.badge}>
          <span className={styles.badgeDot} />
          Virtual Museum 3D
        </span>

        {/* Title */}
        <h1 className={styles.title}>
          S.K.O.M.D.A
        </h1>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          Jelajahi tata tertib dan budaya sekolah melalui pengalaman museum
          virtual 3D yang imersif dan interaktif
        </p>

        {/* Glass card with controls */}
        <div className={styles.glassCard}>
          <div className={styles.controlRow}>
            <span className={styles.controlIcon}>⌨</span>
            <span>
              <strong style={{ color: "rgba(255,255,255,0.85)" }}>WASD / Arrow</strong>{" "}
              untuk berjalan
            </span>
          </div>
          <div className={styles.controlRow}>
            <span className={styles.controlIcon}>🖱</span>
            <span>
              <strong style={{ color: "rgba(255,255,255,0.85)" }}>Mouse</strong>{" "}
              untuk menoleh
            </span>
          </div>
          <div className={styles.controlRow}>
            <span className={styles.controlIcon}>👆</span>
            <span>
              <strong style={{ color: "rgba(255,255,255,0.85)" }}>Klik objek</strong>{" "}
              untuk melihat info
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button className={styles.ctaButton} onClick={handleClick}>
          Masuk Museum
          <span className={styles.ctaArrow}>→</span>
        </button>
      </div>

      {/* Bottom scroll hint */}
      <div className={styles.bottomHint}>
        <div className={styles.scrollIndicator} />
        Klik untuk memulai
      </div>
    </div>
  );
}
