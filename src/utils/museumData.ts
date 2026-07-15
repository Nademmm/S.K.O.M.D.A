export type ExhibitCategory = "tata-tertib" | "budaya";

/** Jenis ikon hologram yang dirender secara procedural (tanpa file asset) */
export type ExhibitIcon =
  | "clock"
  | "uniform"
  | "class"
  | "broom"
  | "shield"
  | "greeting"
  | "hands"
  | "trophy"
  | "flag"
  | "culture";

export interface ExhibitItem {
  id: string;
  category: ExhibitCategory;
  title: string;
  description: string;
  /** Kalimat kunci yang ditonjolkan di panel info */
  highlight: string;
  /** Ikon hologram yang melayang di atas pedestal */
  icon: ExhibitIcon;
  /** Posisi pedestal di dalam ruangan [x, y, z] */
  position: [number, number, number];
  /** Warna aksen hologram/pedestal (hex) */
  color: string;
}

/** Warna aksen per kategori (palet hologram) */
export const CATEGORY_ACCENT: Record<ExhibitCategory, string> = {
  "tata-tertib": "#22d3ee", // cyan-teal
  budaya: "#fbbf24", // amber-gold
};

export const CATEGORY_LABEL: Record<ExhibitCategory, string> = {
  "tata-tertib": "Tata Tertib",
  budaya: "Budaya Sekolah",
};

export const museumData: ExhibitItem[] = [
  {
    id: "tt-1",
    category: "tata-tertib",
    title: "Kehadiran & Ketepatan Waktu",
    highlight: "Hadir maksimal 15 menit sebelum bel masuk.",
    icon: "clock",
    description:
      "Siswa wajib hadir di sekolah tepat waktu, maksimal 15 menit sebelum bel masuk berbunyi. Keterlambatan tanpa keterangan yang sah akan dikenakan sanksi sesuai tata tertib sekolah.",
    position: [-9, 0, -6],
    color: "#22d3ee",
  },
  {
    id: "tt-2",
    category: "tata-tertib",
    title: "Seragam & Kerapian",
    highlight: "Seragam lengkap, rapi, dan sesuai jadwal.",
    icon: "uniform",
    description:
      "Siswa wajib mengenakan seragam sesuai jadwal yang ditentukan, lengkap dengan atribut sekolah, rapi, dan sopan selama berada di lingkungan sekolah.",
    position: [-9, 0, -2],
    color: "#22d3ee",
  },
  {
    id: "tt-3",
    category: "tata-tertib",
    title: "Etika di Kelas",
    highlight: "Hormati guru dan teman, aktif belajar.",
    icon: "class",
    description:
      "Siswa diwajibkan menjaga ketenangan, menghormati guru dan teman, serta aktif mengikuti kegiatan belajar mengajar di dalam kelas.",
    position: [-9, 0, 2],
    color: "#22d3ee",
  },
  {
    id: "tt-4",
    category: "tata-tertib",
    title: "Kebersihan Lingkungan",
    highlight: "Buang sampah pada tempatnya, jaga kebersihan.",
    icon: "broom",
    description:
      "Setiap siswa bertanggung jawab menjaga kebersihan kelas, koridor, dan seluruh area sekolah, termasuk membuang sampah pada tempatnya.",
    position: [-9, 0, 6],
    color: "#22d3ee",
  },
  {
    id: "tt-5",
    category: "tata-tertib",
    title: "Larangan & Sanksi",
    highlight: "Pelanggaran dikenakan sanksi bertahap.",
    icon: "shield",
    description:
      "Membawa barang terlarang, melakukan tindakan kekerasan, atau perilaku tidak terpuji lainnya akan dikenakan sanksi bertahap sesuai buku poin pelanggaran sekolah.",
    position: [-9, 0, 10],
    color: "#22d3ee",
  },
  {
    id: "bd-1",
    category: "budaya",
    title: "Salam & Sapa",
    highlight: "Senyum, Salam, Sapa, Sopan, Santun.",
    icon: "greeting",
    description:
      "Budaya 5S (Senyum, Salam, Sapa, Sopan, Santun) diterapkan setiap hari sebagai bentuk penghormatan antarwarga sekolah.",
    position: [9, 0, -6],
    color: "#fbbf24",
  },
  {
    id: "bd-2",
    category: "budaya",
    title: "Gotong Royong",
    highlight: "Bekerja sama demi kebaikan bersama.",
    icon: "hands",
    description:
      "Sekolah menjunjung tinggi nilai gotong royong melalui kegiatan kerja bakti rutin dan kolaborasi antar siswa dalam berbagai kegiatan.",
    position: [9, 0, -2],
    color: "#fbbf24",
  },
  {
    id: "bd-3",
    category: "budaya",
    title: "Ekstrakurikuler & Prestasi",
    highlight: "Kembangkan bakat, raih prestasi.",
    icon: "trophy",
    description:
      "Beragam kegiatan ekstrakurikuler tersedia untuk mengembangkan bakat siswa, mulai dari bidang akademik, seni, hingga olahraga.",
    position: [9, 0, 2],
    color: "#fbbf24",
  },
  {
    id: "bd-4",
    category: "budaya",
    title: "Upacara & Nasionalisme",
    highlight: "Cinta tanah air lewat upacara bendera.",
    icon: "flag",
    description:
      "Upacara bendera rutin setiap Senin menumbuhkan rasa cinta tanah air dan disiplin bagi seluruh warga sekolah.",
    position: [9, 0, 6],
    color: "#fbbf24",
  },
  {
    id: "bd-5",
    category: "budaya",
    title: "Kearifan Lokal",
    highlight: "Lestarikan budaya dan bahasa daerah.",
    icon: "culture",
    description:
      "Sekolah melestarikan budaya lokal melalui kegiatan seni tradisional, bahasa daerah, dan perayaan hari besar budaya Indonesia.",
    position: [9, 0, 10],
    color: "#fbbf24",
  },
];
