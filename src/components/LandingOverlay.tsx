"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LandingOverlayProps {
  onEnter: () => void;
}

const ease = [0.22, 1, 0.36, 1]; // Premium cubic-bezier (easeOutQuart)

export default function LandingOverlay({ onEnter }: LandingOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    // Timing matching Stage 9 transition
    setTimeout(() => {
      onEnter();
    }, 900);
  };

  // Timings for our 9-stage onboarding ceremony
  const duration = {
    dim: 0.6,
    beam: 0.8,
    title: 1.0,
    desc: 0.8,
    divider: 0.6,
    controlItem: 0.5,
    note: 0.8,
    cta: 0.8,
  };

  const delay = {
    dim: 0.1,
    beam: 0.5,
    title: 1.0,
    desc: 1.6,
    divider: 2.2,
    controls: 2.6,
    note: 3.4,
    cta: 3.8,
  };

  // Keyboard/Mouse Controls Info
  const controlItems = [
    { name: "Movement", value: "W A S D" },
    { name: "Look Around", value: "Mouse" },
    { name: "Interact", value: "Left Click" },
    { name: "Release Cursor", value: "ESC" },
  ];

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-onboarding-bg font-sans text-onboarding-text select-none"
        >
          {/* Subtle animated grid and noise overlays */}
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
          <div className="absolute inset-0 noise-overlay opacity-15 pointer-events-none" />

          {/* Stage 2: Thin vertical light beam offset from the center (like light leaking through an opening door) */}
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 0.25 }}
            transition={{ delay: delay.beam, duration: duration.beam, ease }}
            className="absolute left-[38%] top-0 bottom-0 w-[1px] origin-top bg-gradient-to-b from-transparent via-onboarding-accent to-transparent pointer-events-none"
          />

          {/* Asymmetric composition wrapper */}
          <div className="relative z-10 w-full max-w-7xl h-full flex flex-col justify-between p-8 md:p-16 lg:p-24">
            
            {/* Header / Meta */}
            <div className="flex justify-between items-baseline border-b border-white/[0.04] pb-6">
              <span className="font-mono text-[10px] tracking-[0.25em] text-onboarding-secondary/40 uppercase">
                Museum Catalogue Ref // SKOMDA-01
              </span>
              <span className="font-mono text-[10px] tracking-[0.25em] text-onboarding-accent uppercase">
                Active Archive
              </span>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 my-auto items-start">
              
              {/* Left Column: Expressive Typography Header & Description */}
              <div className="lg:col-span-7 flex flex-col items-start space-y-8">
                {/* Stage 3: Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay.title, duration: duration.title, ease }}
                  className="font-display text-[11vw] sm:text-[8vw] lg:text-[5vw] leading-none font-bold tracking-tight text-onboarding-text"
                >
                  Step Beyond <br />
                  <span className="text-onboarding-secondary/60">The Screen.</span>
                </motion.h1>

                {/* Stage 4: Description (Line-by-line editorial reveal) */}
                <div className="space-y-4 max-w-xl">
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay.desc, duration: duration.desc, ease }}
                    className="text-[15px] sm:text-base text-onboarding-secondary/70 leading-relaxed font-light text-justify"
                  >
                    Welcome to SKOMDA. A place where school information is no longer hidden inside endless scrolling pages. Instead, every hallway, every object, and every interaction becomes part of the learning experience.
                  </motion.p>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay.desc + 0.3, duration: duration.desc, ease }}
                    className="text-[15px] sm:text-base text-onboarding-secondary/70 leading-relaxed font-light text-justify"
                  >
                    This experience transforms school culture and regulations into an interactive museum you can freely navigate. Take your time. Curiosity is encouraged.
                  </motion.p>
                </div>

                {/* Stage 5: Rhythm Divider (Very subtle accent element) */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: delay.divider, duration: duration.divider, ease }}
                  className="h-[1px] w-12 bg-onboarding-accent origin-left"
                />
              </div>

              {/* Right Column: Interactive control metadata */}
              <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-12 lg:pt-8 lg:pl-12 lg:border-l lg:border-white/[0.04]">
                <div className="space-y-6 w-full">
                  <motion.h3 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: delay.controls, duration: 0.5 }}
                    className="font-mono text-[10px] tracking-[0.2em] text-onboarding-secondary uppercase"
                  >
                    Navigation Manual
                  </motion.h3>

                  {/* Stage 6: Controls reveal one by one */}
                  <div className="space-y-4 w-full">
                    {controlItems.map((control, idx) => (
                      <motion.div
                        key={control.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: delay.controls + idx * 0.15,
                          duration: duration.controlItem,
                          ease,
                        }}
                        className="flex justify-between items-baseline border-b border-white/[0.04] pb-3"
                      >
                        <span className="font-mono text-xs tracking-wider text-onboarding-secondary/50 uppercase">
                          {control.name}
                        </span>
                        <span className="font-mono text-xs font-semibold text-onboarding-text">
                          {control.value}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Stage 7: Note */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay.note, duration: duration.note, ease }}
                  className="space-y-2"
                >
                  <p className="font-display italic text-sm text-onboarding-accent font-medium leading-relaxed">
                    &ldquo;Some stories aren&rsquo;t meant to be scrolled.&rdquo;
                  </p>
                  <p className="font-mono text-[9px] tracking-widest text-onboarding-secondary/40 uppercase">
                    They&rsquo;re meant to be explored.
                  </p>
                </motion.div>
              </div>

            </div>

            {/* Bottom Row: CTA trigger (Stage 8) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-white/[0.04] pt-8 gap-6">
              <span className="font-mono text-[10px] tracking-[0.3em] text-onboarding-secondary/30 uppercase">
                Exhibition descent ready // coordinates lock
              </span>
              
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay.cta, duration: duration.cta, ease }}
                onClick={handleStart}
                className="group relative flex items-center justify-between gap-12 border border-white/20 hover:border-onboarding-accent px-8 py-4 bg-transparent cursor-pointer transition-all duration-300 select-none overflow-hidden"
              >
                <span className="font-mono text-xs tracking-[0.25em] text-onboarding-text uppercase z-10 group-hover:text-onboarding-accent transition-colors duration-300">
                  Explore The Museum
                </span>
                
                <span className="text-onboarding-text z-10 group-hover:text-onboarding-accent group-hover:translate-x-2 transition-all duration-300">
                  →
                </span>
                
                {/* Thin tactile overlay slide */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-onboarding-surface transition-transform duration-500 ease-[0.16,1,0.3,1] z-0" />
              </motion.button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
