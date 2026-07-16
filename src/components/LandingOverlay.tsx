"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./LandingOverlay.module.css";

interface LandingOverlayProps {
  onEnter: () => void;
}

type Stage = "landing" | "stage1" | "stage2" | "details" | "exiting";

export default function LandingOverlay({ onEnter }: LandingOverlayProps) {
  const [stage, setStage] = useState<Stage>("landing");
  const [isCtaHovered, setIsCtaHovered] = useState(false);
  const [isEnterHovered, setIsEnterHovered] = useState(false);

  // Stage 1 -> Stage 2 -> Details automated transitions
  useEffect(() => {
    if (stage === "stage1") {
      const timer = setTimeout(() => {
        setStage("stage2");
      }, 450); // 300-500ms duration for Stage 1
      return () => clearTimeout(timer);
    } else if (stage === "stage2") {
      const timer = setTimeout(() => {
        setStage("details");
      }, 800); // 600ms beam animation + some pause
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleStartOnboarding = () => {
    setStage("stage1");
  };

  const handleBeginExploration = () => {
    setStage("exiting");
    // Call the parent enter handler after a short delay to match the fade-out
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  // Determine container classes based on state
  const getContainerClass = () => {
    switch (stage) {
      case "landing":
        return `${styles.overlay} ${styles.landingBg}`;
      case "stage1":
        return `${styles.overlay} ${styles.darkBg} ${styles.noCursor} ${styles.noInteract}`;
      case "stage2":
        return `${styles.overlay} ${styles.darkBg} ${styles.noCursor} ${styles.noInteract}`;
      case "details":
        return `${styles.overlay} ${styles.darkBg}`;
      case "exiting":
        return `${styles.overlay} ${styles.darkBg} ${styles.fadeOut}`;
      default:
        return styles.overlay;
    }
  };

  return (
    <div className={getContainerClass()}>
      <AnimatePresence mode="wait">
        {/* LANDING PAGE (REALITY) */}
        {stage === "landing" && (
          <motion.div
            key="landing-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className={styles.editorialContent}
          >
            <div className={styles.landingHeader}>
              <span className={styles.eyebrow}>Interactive Museum Experience</span>
              <h1 className={styles.hugeTitle}>S.K.O.M.D.A</h1>
              <span className={styles.subtitle}>SMK Telkom Sidoarjo</span>
            </div>

            <p className={styles.landingCopy}>
              A digital threshold. Cross the boundary between a traditional website and
              an immersive three-dimensional space where every room, object, and exhibit
              tells the story of our school's culture, values, and vision.
            </p>

            <div className={styles.landingCtaContainer}>
              <motion.button
                onClick={handleStartOnboarding}
                onHoverStart={() => setIsEnterHovered(true)}
                onHoverEnd={() => setIsEnterHovered(false)}
                className={styles.minimalBtn}
              >
                Enter the Experience
                <motion.span
                  animate={{ x: isEnterHovered ? 4 : 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={styles.btnArrow}
                >
                  →
                </motion.span>
                <span
                  className={`${styles.underline} ${
                    isEnterHovered ? styles.underlineActive : ""
                  }`}
                />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ONBOARDING CEREMONY DETAIL STATES */}
        {stage === "details" && (
          <motion.div
            key="onboarding-details"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.25,
                  delayChildren: 0.1,
                },
              },
            }}
            className={styles.editorialContent}
          >
            {/* Stage 3: Large Editorial Typography */}
            <motion.h2
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              className={styles.ceremonyTitle}
            >
              Before You Enter
            </motion.h2>

            {/* Stage 4: Supporting Copy */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              className={styles.ceremonyCopy}
            >
              Welcome to SKOMDA. This is not another school website. Instead of scrolling
              through pages of information, you'll explore an interactive three-dimensional
              environment. Take your time. Observe. Interact. Discover. Learn through exploration.
            </motion.p>

            {/* Stage 5: Subtle Divider */}
            <motion.div
              variants={{
                hidden: { opacity: 0, scaleX: 0 },
                visible: { opacity: 0.2, scaleX: 1 },
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className={styles.subtleDivider}
            />

            {/* Stage 6: Controls List */}
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
              }}
              className={styles.controlsList}
            >
              {[
                { name: "Movement", value: "W A S D" },
                { name: "Look Around", value: "Mouse" },
                { name: "Interact", value: "Left Click" },
                { name: "Release Cursor", value: "ESC" },
              ].map((ctrl, i) => (
                <motion.div
                  key={ctrl.name}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, delay: i * 0.15, ease: [0.25, 1, 0.5, 1] }}
                  className={styles.controlRow}
                >
                  <span className={styles.controlLabel}>{ctrl.name}</span>
                  <span className={styles.controlValue}>{ctrl.value}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Stage 7: Small note */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              className={styles.ceremonyNote}
            >
              Some stories aren't meant to be scrolled. They're meant to be explored.
            </motion.p>

            {/* Stage 8: CTA Button */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              className={styles.ceremonyCtaContainer}
            >
              <motion.button
                onClick={handleBeginExploration}
                onHoverStart={() => setIsCtaHovered(true)}
                onHoverEnd={() => setIsCtaHovered(false)}
                className={styles.minimalBtn}
              >
                Begin Exploration
                <motion.span
                  animate={{ x: isCtaHovered ? 4 : 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={styles.btnArrow}
                >
                  →
                </motion.span>
                <span
                  className={`${styles.underline} ${
                    isCtaHovered ? styles.underlineActive : ""
                  }`}
                />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage 2: Central Light Leak Beam */}
      {stage === "stage2" && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "60vh", opacity: 0.45 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className={styles.lightBeam}
        />
      )}

      {/* Keep subtle background beam in details stage for depth */}
      {stage === "details" && (
        <div className={styles.lightBeamBg} />
      )}
    </div>
  );
}
