"use client";

import dynamic from "next/dynamic";
import { SettingsProvider } from "@/settings/SettingsContext";

// Museum 3D memakai window/document (Canvas, Pointer Lock) sehingga harus
// di-render hanya di client, tanpa SSR.
const MuseumExperience = dynamic(
  () => import("@/components/MuseumExperience"),
  { ssr: false }
);

export default function MuseumExperienceLoader() {
  return (
    <SettingsProvider>
      <MuseumExperience />
    </SettingsProvider>
  );
}
