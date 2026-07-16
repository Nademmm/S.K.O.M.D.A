"use client";

import { KEYBINDS } from "@/settings/settingsConfig";
import styles from "./SettingsPanel.module.css";

/**
 * Menampilkan seluruh keybind yang sedang dipakai (read-only).
 * Remapping belum diimplementasikan — sesuai permintaan, hanya tampilan.
 */
export function KeybindList() {
  return (
    <div className={styles.keybindGrid}>
      {KEYBINDS.map((bind) => (
        <div key={bind.action} className={styles.keybindRow}>
          <span className={styles.keybindAction}>{bind.action}</span>
          <span className={styles.keybindKeys}>
            {bind.keys.map((k) => (
              <kbd key={k} className={styles.keycap}>
                {k}
              </kbd>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
