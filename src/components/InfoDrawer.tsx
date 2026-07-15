"use client";

import { useEffect, useRef, useState } from "react";
import {
  CATEGORY_LABEL,
  type ExhibitIcon,
  type ExhibitItem,
} from "@/utils/museumData";

interface InfoDrawerProps {
  /** Item yang dipilih; null berarti drawer tertutup */
  item: ExhibitItem | null;
  onClose: () => void;
}

/** Emoji sederhana sebagai ikon kategori di header drawer (tanpa asset) */
const ICON_GLYPH: Record<ExhibitIcon, string> = {
  clock: "⏰",
  uniform: "👔",
  class: "📚",
  broom: "🧹",
  shield: "🛡️",
  greeting: "🤝",
  hands: "🤲",
  trophy: "🏆",
  flag: "🚩",
  culture: "🏛️",
};

/**
 * Panel geser (side drawer) yang meluncur dari kanan untuk menampilkan detail
 * aturan/budaya. Museum tetap terlihat di sisi kiri sehingga imersi terjaga.
 * Konten dipertahankan selama animasi menutup agar transisi mulus.
 */
export default function InfoDrawer({ item, onClose }: InfoDrawerProps) {
  const open = item !== null;
  // Simpan item terakhir agar teks tidak hilang mendadak saat drawer menutup
  const [displayItem, setDisplayItem] = useState<ExhibitItem | null>(item);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (item) {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setDisplayItem(item);
    } else {
      // Tunggu animasi slide-out selesai sebelum melepas konten
      closeTimer.current = setTimeout(() => setDisplayItem(null), 350);
    }
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [item]);

  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const accent = displayItem?.color ?? "#22d3ee";

  return (
    <>
      {/* Scrim tipis (klik untuk menutup) — tidak menutup total agar museum tetap terasa */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 45,
          background: "rgba(0,0,0,0.25)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Panel drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 46,
          height: "100%",
          width: "min(420px, 88vw)",
          transform: open ? "translateX(0)" : "translateX(105%)",
          transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          background: "rgba(15, 23, 42, 0.82)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderLeft: `1px solid ${accent}55`,
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {displayItem && (
          <>
            {/* Garis aksen atas */}
            <div
              style={{
                height: 4,
                background: `linear-gradient(90deg, ${accent}, transparent)`,
              }}
            />

            {/* Header */}
            <div style={{ padding: "1.75rem 1.75rem 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 999,
                    padding: "0.35rem 0.8rem",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    background: `${accent}22`,
                    color: accent,
                    border: `1px solid ${accent}55`,
                  }}
                >
                  {CATEGORY_LABEL[displayItem.category]}
                </span>
                <button
                  onClick={onClose}
                  aria-label="Tutup"
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.8)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Ikon kategori besar + halo */}
              <div
                style={{
                  margin: "1.5rem 0 0.5rem",
                  display: "grid",
                  placeItems: "center",
                  width: 84,
                  height: 84,
                  borderRadius: 20,
                  fontSize: "2.4rem",
                  background: `radial-gradient(circle at 50% 40%, ${accent}33, transparent 70%)`,
                  border: `1px solid ${accent}44`,
                  boxShadow: `0 0 30px ${accent}33`,
                }}
              >
                {ICON_GLYPH[displayItem.icon]}
              </div>

              <h2
                style={{
                  margin: "0.75rem 0 0",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {displayItem.title}
              </h2>
            </div>

            {/* Konten */}
            <div
              style={{
                padding: "1.25rem 1.75rem",
                overflowY: "auto",
                flex: 1,
              }}
            >
              {/* Highlight/quote dengan garis aksen */}
              <div
                style={{
                  borderLeft: `3px solid ${accent}`,
                  paddingLeft: "0.9rem",
                  margin: "0 0 1.25rem",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    fontWeight: 600,
                    fontStyle: "italic",
                    color: "#e2e8f0",
                    lineHeight: 1.5,
                  }}
                >
                  “{displayItem.highlight}”
                </p>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: "0.92rem",
                  lineHeight: 1.7,
                  color: "rgba(226, 232, 240, 0.8)",
                }}
              >
                {displayItem.description}
              </p>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "1rem 1.75rem 1.75rem",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <button
                onClick={onClose}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  background: accent,
                  transition: "filter 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
                }}
              >
                Kembali Menjelajah
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
