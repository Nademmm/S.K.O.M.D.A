"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  type Settings,
} from "./settingsConfig";

/* ─────────────────────────────────────────────────────────────���───────────
   Persistence helpers
   ───────────────────────────────────────────────────────────────────────── */

/** Baca pengaturan dari localStorage, gabungkan dengan default agar key baru
 *  tetap terisi meski data lama tidak memilikinya. Tahan terhadap JSON rusak. */
function readStoredSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    // Merge: default sebagai basis, override dengan nilai tersimpan yang valid.
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeStoredSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* Storage penuh / diblokir — abaikan dengan tenang. */
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   Context
   ───────────────────────────────────────────────────────────────────────── */

interface SettingsContextValue {
  settings: Settings;
  /** Perbarui satu field; langsung diterapkan & (opsional) disimpan otomatis. */
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  /** Kembalikan semua nilai ke default dan simpan ke localStorage. */
  resetSettings: () => void;
  /** Paksa simpan snapshot pengaturan saat ini ke localStorage. */
  saveSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Mulai dari default agar output SSR/klien konsisten; nilai tersimpan
  // dihidrasi setelah mount untuk menghindari mismatch hydration.
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const hydrated = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(readStoredSettings());
    hydrated.current = true;
  }, []);

  // Persist otomatis setiap perubahan (hanya setelah hidrasi awal).
  useEffect(() => {
    if (!hydrated.current) return;
    writeStoredSettings(settings);
  }, [settings]);

  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    writeStoredSettings(DEFAULT_SETTINGS);
  }, []);

  const saveSettings = useCallback(() => {
    setSettings((current) => {
      writeStoredSettings(current);
      return current;
    });
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, updateSetting, resetSettings, saveSettings }),
    [settings, updateSetting, resetSettings, saveSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * Hook akses pengaturan. Mengembalikan `settings`, `updateSetting`,
 * `resetSettings`, dan `saveSettings`. Harus dipakai di dalam SettingsProvider.
 */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings harus dipakai di dalam <SettingsProvider>.");
  }
  return ctx;
}
