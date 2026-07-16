"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "@/settings/SettingsContext";
import {
  ACCESSIBILITY_TOGGLES,
  AUDIO_SLIDERS,
  AUDIO_TOGGLES,
  COLOR_BLIND_OPTIONS,
  CROSSHAIR_OPTIONS,
  GAMEPLAY_SLIDERS,
  GAMEPLAY_TOGGLES,
  GRAPHICS_TOGGLES,
  MOUSE_CAMERA_SLIDERS,
  MOUSE_CAMERA_TOGGLES,
  QUALITY_OPTIONS,
  SETTINGS_TABS,
  SHADOW_OPTIONS,
  TEXTURE_OPTIONS,
  type ColorBlindMode,
  type CrosshairStyle,
  type QualityPreset,
  type SettingsTabId,
  type ShadowQuality,
  type Settings,
  type SliderField,
  type TextureQuality,
  type ToggleField,
} from "@/settings/settingsConfig";
import {
  SettingsDropdown,
  SettingsSection,
  SettingsSlider,
  SettingsToggle,
} from "./SettingsControls";
import { KeybindList } from "./KeybindList";
import { ConfirmDialog } from "./ConfirmDialog";
import styles from "./SettingsPanel.module.css";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

/* Helper generik: render sekumpulan slider/toggle dari metadata config,
   terhubung langsung ke store lewat updateSetting. Menghindari duplikasi. */
function renderSliders(
  fields: SliderField[],
  settings: Settings,
  update: ReturnType<typeof useSettings>["updateSetting"]
) {
  return fields.map((f) => (
    <SettingsSlider
      key={f.key}
      label={f.label}
      description={f.description}
      value={settings[f.key]}
      min={f.min}
      max={f.max}
      step={f.step}
      unit={f.unit}
      precision={f.precision}
      onChange={(v) => update(f.key, v)}
    />
  ));
}

function renderToggles(
  fields: ToggleField[],
  settings: Settings,
  update: ReturnType<typeof useSettings>["updateSetting"]
) {
  return fields.map((f) => (
    <SettingsToggle
      key={f.key}
      label={f.label}
      description={f.description}
      value={settings[f.key]}
      onChange={(v) => update(f.key, v)}
    />
  ));
}

/**
 * Panel pengaturan bergaya game AAA: modal terpusat dengan tab di kiri,
 * konten di kanan, glassmorphism gelap, dan animasi fade + scale.
 */
export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("mouse-camera");
  const [confirmReset, setConfirmReset] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Tutup dengan Escape (kecuali dialog konfirmasi sedang terbuka).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (confirmReset) return; // dialog menangani Escape-nya sendiri
      e.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, confirmReset]);

  const content = useMemo(() => {
    switch (activeTab) {
      case "mouse-camera":
        return (
          <>
            <SettingsSection title="Camera">
              {renderSliders(MOUSE_CAMERA_SLIDERS, settings, updateSetting)}
            </SettingsSection>
            <SettingsSection title="Behavior">
              {renderToggles(MOUSE_CAMERA_TOGGLES, settings, updateSetting)}
            </SettingsSection>
          </>
        );
      case "audio":
        return (
          <>
            <SettingsSection title="Volume">
              {renderSliders(AUDIO_SLIDERS, settings, updateSetting)}
            </SettingsSection>
            <SettingsSection title="Sound Options">
              {renderToggles(AUDIO_TOGGLES, settings, updateSetting)}
            </SettingsSection>
          </>
        );
      case "accessibility":
        return (
          <>
            <SettingsSection
              title="Comfort"
              description="Sesuaikan pengalaman agar lebih nyaman dan mudah diakses."
            >
              {renderToggles(ACCESSIBILITY_TOGGLES, settings, updateSetting)}
            </SettingsSection>
            <SettingsSection title="Vision">
              <SettingsDropdown<ColorBlindMode>
                label="Enable Color Blind Mode"
                value={settings.colorBlindMode}
                options={COLOR_BLIND_OPTIONS}
                onChange={(v) => updateSetting("colorBlindMode", v)}
              />
            </SettingsSection>
          </>
        );
      case "graphics":
        return (
          <>
            <SettingsSection title="Quality">
              <SettingsDropdown<QualityPreset>
                label="Quality Presets"
                value={settings.qualityPreset}
                options={QUALITY_OPTIONS}
                onChange={(v) => updateSetting("qualityPreset", v)}
              />
              <SettingsDropdown<ShadowQuality>
                label="Shadow Quality"
                value={settings.shadowQuality}
                options={SHADOW_OPTIONS}
                onChange={(v) => updateSetting("shadowQuality", v)}
              />
              <SettingsDropdown<TextureQuality>
                label="Texture Quality"
                value={settings.textureQuality}
                options={TEXTURE_OPTIONS}
                onChange={(v) => updateSetting("textureQuality", v)}
              />
            </SettingsSection>
            <SettingsSection title="Effects">
              {renderToggles(GRAPHICS_TOGGLES, settings, updateSetting)}
            </SettingsSection>
          </>
        );
      case "gameplay":
        return (
          <>
            <SettingsSection title="Movement">
              {renderSliders(GAMEPLAY_SLIDERS, settings, updateSetting)}
            </SettingsSection>
            <SettingsSection title="Interaction">
              <SettingsDropdown<CrosshairStyle>
                label="Crosshair Style"
                value={settings.crosshairStyle}
                options={CROSSHAIR_OPTIONS}
                onChange={(v) => updateSetting("crosshairStyle", v)}
              />
              {renderToggles(GAMEPLAY_TOGGLES, settings, updateSetting)}
            </SettingsSection>
          </>
        );
      case "controls":
        return (
          <SettingsSection
            title="Keybinds"
            description="Kontrol yang sedang digunakan. Remapping belum tersedia."
          >
            <KeybindList />
          </SettingsSection>
        );
      default:
        return null;
    }
  }, [activeTab, settings, updateSetting]);

  return (
    <AnimatePresence>
      {open && (
        <div className={styles.root} role="dialog" aria-modal="true" aria-label="Settings">
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            ref={modalRef}
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <header className={styles.header}>
              <div className={styles.headerTitles}>
                <span className={styles.eyebrow}>System</span>
                <h2 className={styles.title}>Settings</h2>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close settings"
              >
                ✕
              </button>
            </header>

            {/* Body: tab rail + content */}
            <div className={styles.body}>
              <nav className={styles.tabRail} aria-label="Settings categories">
                {SETTINGS_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`${styles.tab} ${
                      activeTab === tab.id ? styles.tabActive : ""
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={activeTab === tab.id}
                  >
                    <span className={styles.tabIcon} aria-hidden="true">
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              <div className={styles.content}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {content}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <footer className={styles.footer}>
              <span className={styles.footerHint}>
                Perubahan tersimpan otomatis
              </span>
              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonDanger}`}
                  onClick={() => setConfirmReset(true)}
                >
                  Reset to Default
                </button>
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  onClick={onClose}
                >
                  Done
                </button>
              </div>
            </footer>

            {/* Reset confirmation */}
            <ConfirmDialog
              open={confirmReset}
              title="Reset to Default?"
              message="Semua pengaturan akan dikembalikan ke nilai bawaan. Tindakan ini tidak dapat dibatalkan."
              confirmLabel="Reset"
              cancelLabel="Cancel"
              onCancel={() => setConfirmReset(false)}
              onConfirm={() => {
                resetSettings();
                setConfirmReset(false);
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
