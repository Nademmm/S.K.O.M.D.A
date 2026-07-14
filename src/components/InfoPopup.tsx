"use client";

import type { ExhibitItem } from "@/utils/museumData";

interface InfoPopupProps {
  item: ExhibitItem;
  onClose: () => void;
}

/**
 * Popup HTML (di luar canvas Three.js) yang menampilkan detail exhibit
 * saat pengguna mengklik salah satu objek interaktif.
 */
export default function InfoPopup({ item, onClose }: InfoPopupProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            style={{
              backgroundColor:
                item.category === "tata-tertib" ? "#3b82f633" : "#f59e0b33",
              color: item.category === "tata-tertib" ? "#60a5fa" : "#fbbf24",
            }}
          >
            {item.category === "tata-tertib" ? "Tata Tertib" : "Budaya Sekolah"}
          </span>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>
        <h2 className="mb-2 text-xl font-semibold">{item.title}</h2>
        <p className="text-sm leading-relaxed text-zinc-300">
          {item.description}
        </p>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-white/10 py-2 text-sm font-medium transition-colors hover:bg-white/20"
        >
          Kembali Menjelajah
        </button>
      </div>
    </div>
  );
}
