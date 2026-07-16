"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./SettingsPanel.module.css";
import type { SelectOption } from "@/settings/settingsConfig";

/* ═══════════════════════════════════════════════════════════════════════
   Reusable, presentational settings controls.
   Murni UI — tanpa logika penyimpanan. State dikelola oleh pemanggil.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── SettingsSection ──────────────────────────────────────────────────── */

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {description && <p className={styles.sectionDescription}>{description}</p>}
      </div>
      {children}
    </section>
  );
}

/* ── SettingsRow — label kiri + kontrol kanan ─────────────────────────── */

interface SettingsRowProps {
  label: string;
  description?: string;
  htmlFor?: string;
  /** Slider butuh area kontrol yang lebih lebar. */
  wide?: boolean;
  children: React.ReactNode;
}

export function SettingsRow({ label, description, htmlFor, wide, children }: SettingsRowProps) {
  return (
    <div className={styles.row}>
      <label className={styles.rowLabelBlock} htmlFor={htmlFor}>
        <span className={styles.rowLabel}>{label}</span>
        {description && <span className={styles.rowDescription}>{description}</span>}
      </label>
      <div className={wide ? styles.rowControlWide : styles.rowControl}>{children}</div>
    </div>
  );
}

/* ── SettingsSlider ───────────────────────────────────────────────────── */

interface SettingsSliderProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  precision?: number;
  onChange: (value: number) => void;
}

export function SettingsSlider({
  label,
  description,
  value,
  min,
  max,
  step,
  unit = "",
  precision = 0,
  onChange,
}: SettingsSliderProps) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  const display = `${value.toFixed(precision)}${unit}`;

  return (
    <SettingsRow label={label} description={description} htmlFor={id} wide>
      <input
        id={id}
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
        aria-valuetext={display}
      />
      <span className={styles.sliderValue}>{display}</span>
    </SettingsRow>
  );
}

/* ── SettingsToggle ───────────────────────────────────────────────────── */

interface SettingsToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function SettingsToggle({ label, description, value, onChange }: SettingsToggleProps) {
  return (
    <SettingsRow label={label} description={description}>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        className={`${styles.toggle} ${value ? styles.toggleOn : ""}`}
        onClick={() => onChange(!value)}
      >
        <span className={styles.toggleKnob} aria-hidden="true" />
      </button>
    </SettingsRow>
  );
}

/* ── SettingsDropdown ─────────────────────────────────────────────────── */

interface SettingsDropdownProps<T extends string> {
  label: string;
  description?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}

export function SettingsDropdown<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
}: SettingsDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  // Tutup saat klik di luar atau tekan Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  return (
    <SettingsRow label={label} description={description}>
      <div className={styles.dropdown} ref={ref}>
        <button
          type="button"
          className={styles.dropdownTrigger}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {current?.label ?? value}
          <span className={`${styles.dropdownCaret} ${open ? styles.dropdownCaretOpen : ""}`}>
            ▼
          </span>
        </button>
        {open && (
          <ul className={styles.dropdownMenu} role="listbox">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={active}
                  className={`${styles.dropdownOption} ${
                    active ? styles.dropdownOptionActive : ""
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  {active && <span className={styles.dropdownCheck}>✓</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SettingsRow>
  );
}
