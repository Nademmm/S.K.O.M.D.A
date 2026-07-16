/**
 * Single source of truth untuk seluruh pengaturan game.
 *
 * Semua nilai default, rentang slider, opsi dropdown, tab, dan keybind
 * didefinisikan di sini — komponen UI hanya membaca metadata ini, sehingga
 * tidak ada nilai yang di-hardcode di lapisan tampilan.
 */

/* ─────────────────────────────────────────────────────────────────────────
   Tipe pengaturan
   ──────────────────────────────────────────���────────────────────────────── */

export type ColorBlindMode = "off" | "protanopia" | "deuteranopia" | "tritanopia";
export type QualityPreset = "low" | "medium" | "high" | "ultra";
export type ShadowQuality = "off" | "low" | "medium" | "high";
export type TextureQuality = "low" | "medium" | "high" | "ultra";
export type CrosshairStyle = "dot" | "cross" | "circle" | "none";

export interface Settings {
  // 1. Mouse & Camera
  mouseSensitivity: number;
  cameraSmoothness: number;
  cameraFov: number;
  invertYAxis: boolean;
  mouseAcceleration: boolean;
  cameraShake: boolean;

  // 2. Audio (0–100)
  masterVolume: number;
  musicVolume: number;
  environmentVolume: number;
  uiVolume: number;
  footstepSound: boolean;
  muteAll: boolean;

  // 3. Accessibility
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  subtitles: boolean;
  showInteractionHint: boolean;
  alwaysCrosshair: boolean;
  colorBlindMode: ColorBlindMode;

  // 4. Graphics
  qualityPreset: QualityPreset;
  shadowQuality: ShadowQuality;
  textureQuality: TextureQuality;
  antiAliasing: boolean;
  bloom: boolean;
  ambientOcclusion: boolean;
  showFps: boolean;

  // 5. Gameplay
  walkingSpeed: number;
  runningSpeed: number;
  headBobbing: boolean;
  interactionDistance: number;
  crosshairStyle: CrosshairStyle;
  autoSave: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────
   Nilai default
   ───────────────────────────────────────────────────────────────────────── */

export const DEFAULT_SETTINGS: Settings = {
  // Mouse & Camera
  mouseSensitivity: 1.0,
  cameraSmoothness: 35,
  cameraFov: 75,
  invertYAxis: false,
  mouseAcceleration: false,
  cameraShake: true,

  // Audio
  masterVolume: 80,
  musicVolume: 60,
  environmentVolume: 70,
  uiVolume: 75,
  footstepSound: true,
  muteAll: false,

  // Accessibility
  reduceMotion: false,
  highContrast: false,
  largeText: false,
  subtitles: false,
  showInteractionHint: true,
  alwaysCrosshair: false,
  colorBlindMode: "off",

  // Graphics
  qualityPreset: "high",
  shadowQuality: "medium",
  textureQuality: "high",
  antiAliasing: true,
  bloom: true,
  ambientOcclusion: true,
  showFps: false,

  // Gameplay
  walkingSpeed: 5,
  runningSpeed: 9,
  headBobbing: true,
  interactionDistance: 4,
  crosshairStyle: "dot",
  autoSave: true,
};

/* ─────────────────────────────────────────────────────────────────────────
   Metadata field (dipakai oleh komponen UI reusable)
   ───────────────────────────────────────────────────────────────────────── */

type NumericKey = {
  [K in keyof Settings]: Settings[K] extends number ? K : never;
}[keyof Settings];

type BooleanKey = {
  [K in keyof Settings]: Settings[K] extends boolean ? K : never;
}[keyof Settings];

export interface SliderField {
  key: NumericKey;
  label: string;
  min: number;
  max: number;
  step: number;
  /** Cara menampilkan nilai di UI (mis. "%", "°", "×"). */
  unit?: string;
  /** Jumlah desimal saat merender nilai. */
  precision?: number;
  description?: string;
}

export interface ToggleField {
  key: BooleanKey;
  label: string;
  description?: string;
}

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SelectField<T extends string = string> {
  key: keyof Settings;
  label: string;
  options: SelectOption<T>[];
  description?: string;
}

/* Opsi dropdown (dipakai ulang di beberapa tempat) */
export const COLOR_BLIND_OPTIONS: SelectOption<ColorBlindMode>[] = [
  { value: "off", label: "Off" },
  { value: "protanopia", label: "Protanopia" },
  { value: "deuteranopia", label: "Deuteranopia" },
  { value: "tritanopia", label: "Tritanopia" },
];

export const QUALITY_OPTIONS: SelectOption<QualityPreset>[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "ultra", label: "Ultra" },
];

export const SHADOW_OPTIONS: SelectOption<ShadowQuality>[] = [
  { value: "off", label: "Off" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const TEXTURE_OPTIONS: SelectOption<TextureQuality>[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "ultra", label: "Ultra" },
];

export const CROSSHAIR_OPTIONS: SelectOption<CrosshairStyle>[] = [
  { value: "dot", label: "Dot" },
  { value: "cross", label: "Cross" },
  { value: "circle", label: "Circle" },
  { value: "none", label: "None" },
];

/* ─────────────────────────────────────────────────────────────────────────
   Keybinds (hanya ditampilkan — remapping belum diimplementasikan)
   ───────────────────────────────────────────────────────────────────────── */

export interface Keybind {
  keys: string[];
  action: string;
}

export const KEYBINDS: Keybind[] = [
  { keys: ["W"], action: "Move Forward" },
  { keys: ["S"], action: "Move Back" },
  { keys: ["A"], action: "Move Left" },
  { keys: ["D"], action: "Move Right" },
  { keys: ["Shift"], action: "Sprint" },
  { keys: ["Space"], action: "Jump" },
  { keys: ["E"], action: "Interact" },
  { keys: ["O"], action: "Settings / Pause" },
];

/* ─────────────────────────────────────────────────────────────────────────
   Definisi tab & konten setiap kategori
   ───────────────────────────────────────────────────────────────────────── */

export type SettingsTabId =
  | "mouse-camera"
  | "audio"
  | "accessibility"
  | "graphics"
  | "gameplay"
  | "controls";

export interface SettingsTab {
  id: SettingsTabId;
  label: string;
  /** Ikon glyph sederhana (procedural, tanpa file asset). */
  icon: string;
}

export const SETTINGS_TABS: SettingsTab[] = [
  { id: "mouse-camera", label: "Mouse & Camera", icon: "◎" },
  { id: "audio", label: "Audio", icon: "♪" },
  { id: "accessibility", label: "Accessibility", icon: "◐" },
  { id: "graphics", label: "Graphics", icon: "✦" },
  { id: "gameplay", label: "Gameplay", icon: "⛨" },
  { id: "controls", label: "Controls", icon: "⌨" },
];

/* Field per kategori — dipakai oleh SettingsPanel untuk merender baris. */

export const MOUSE_CAMERA_SLIDERS: SliderField[] = [
  {
    key: "mouseSensitivity",
    label: "Mouse Sensitivity",
    min: 0.1,
    max: 5.0,
    step: 0.1,
    unit: "×",
    precision: 1,
    description: "Kecepatan kamera mengikuti gerakan mouse.",
  },
  {
    key: "cameraSmoothness",
    label: "Camera Smoothness",
    min: 0,
    max: 100,
    step: 1,
    description: "Peredaman gerakan kamera. 0 = instan, 100 = sangat halus.",
  },
  {
    key: "cameraFov",
    label: "Camera FOV",
    min: 60,
    max: 100,
    step: 1,
    unit: "°",
    description: "Bidang pandang (field of view) kamera.",
  },
];

export const MOUSE_CAMERA_TOGGLES: ToggleField[] = [
  { key: "invertYAxis", label: "Invert Y Axis", description: "Balik arah vertikal mouse." },
  { key: "mouseAcceleration", label: "Enable Mouse Acceleration" },
  { key: "cameraShake", label: "Camera Shake" },
];

export const AUDIO_SLIDERS: SliderField[] = [
  { key: "masterVolume", label: "Master Volume", min: 0, max: 100, step: 1, unit: "%" },
  { key: "musicVolume", label: "Background Music", min: 0, max: 100, step: 1, unit: "%" },
  { key: "environmentVolume", label: "Environment Sound", min: 0, max: 100, step: 1, unit: "%" },
  { key: "uiVolume", label: "UI Sound", min: 0, max: 100, step: 1, unit: "%" },
];

export const AUDIO_TOGGLES: ToggleField[] = [
  { key: "footstepSound", label: "Footstep Sound" },
  { key: "muteAll", label: "Mute All", description: "Bisukan seluruh audio." },
];

export const ACCESSIBILITY_TOGGLES: ToggleField[] = [
  {
    key: "reduceMotion",
    label: "Reduce Motion",
    description: "Nonaktifkan animasi berat, kurangi camera bobbing & shake.",
  },
  { key: "highContrast", label: "High Contrast Mode" },
  { key: "largeText", label: "Large Text" },
  { key: "subtitles", label: "Subtitle" },
  { key: "showInteractionHint", label: "Show Interaction Hint" },
  { key: "alwaysCrosshair", label: "Always Crosshair" },
];

export const GRAPHICS_TOGGLES: ToggleField[] = [
  { key: "antiAliasing", label: "Anti Aliasing" },
  { key: "bloom", label: "Bloom Effect" },
  { key: "ambientOcclusion", label: "Ambient Occlusion" },
  { key: "showFps", label: "Show FPS Counter" },
];

export const GAMEPLAY_SLIDERS: SliderField[] = [
  {
    key: "walkingSpeed",
    label: "Walking Speed",
    min: 1,
    max: 10,
    step: 0.5,
    unit: " m/s",
    precision: 1,
  },
  {
    key: "runningSpeed",
    label: "Running Speed",
    min: 1,
    max: 16,
    step: 0.5,
    unit: " m/s",
    precision: 1,
  },
  {
    key: "interactionDistance",
    label: "Interaction Distance",
    min: 1,
    max: 8,
    step: 0.5,
    unit: " m",
    precision: 1,
  },
];

export const GAMEPLAY_TOGGLES: ToggleField[] = [
  { key: "headBobbing", label: "Head Bobbing" },
  { key: "autoSave", label: "Auto Save Progress" },
];

/** Kunci localStorage untuk menyimpan pengaturan. */
export const SETTINGS_STORAGE_KEY = "skomda:settings:v1";
