"use client";

interface SettingsButtonProps {
  onClick: () => void;
}

/**
 * Tombol gear putih kaca di HUD — digunakan hanya sebagai fallback
 * jika HudShell tidak terpasang. Saat menjelajah, HudShell yang menangani
 * tombol settings di cluster ikon kanan atas.
 */
export default function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Buka pengaturan"
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 50,
        width: 40,
        height: 40,
        display: "grid",
        placeItems: "center",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(238,238,238,0.80)",
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
        color: "rgba(0,0,0,0.65)",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        transition: "transform 160ms ease, background 160ms ease, border-color 160ms ease, color 160ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(238,238,238,0.92)";
        e.currentTarget.style.borderColor = "rgba(203,41,87,0.35)";
        e.currentTarget.style.color = "#CB2957";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(238,238,238,0.80)";
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
        e.currentTarget.style.color = "rgba(0,0,0,0.65)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M19.4 13a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1H2a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 3.6 8.5a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H8a1.7 1.7 0 0 0 1-1.56V2a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V8a1.7 1.7 0 0 0 1.56 1H22a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    </button>
  );
}
