export type ExhibitCategory =
  | "tata-tertib"
  | "budaya"
  | "sejarah"
  | "prestasi"
  | "jurusan"
  | "fasilitas"
  | "ekskul"
  | "visi-misi";

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
  /** 2–3 fakta menarik yang ditampilkan di bagian Facts panel info */
  facts?: string[];
  /** URL gambar untuk slot gambar di panel info (opsional) */
  imageUrl?: string;
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
  budaya:        "#fbbf24", // amber-gold
  sejarah:       "#a78bfa", // violet
  prestasi:      "#34d399", // emerald
  jurusan:       "#fb923c", // orange
  fasilitas:     "#60a5fa", // blue
  ekskul:        "#f472b6", // pink
  "visi-misi":   "#94a3b8", // slate
};

export const CATEGORY_LABEL: Record<ExhibitCategory, string> = {
  "tata-tertib": "Tata Tertib",
  budaya:        "Budaya Sekolah",
  sejarah:       "Sejarah Sekolah",
  prestasi:      "Prestasi",
  jurusan:       "Program Keahlian",
  fasilitas:     "Fasilitas",
  ekskul:        "Ekstrakurikuler",
  "visi-misi":   "Visi & Misi",
};

export const museumData: ExhibitItem[] = [
  /* ── Tata Tertib ─────────────────────────────────────────────── */
  {
    id: "tt-1",
    category: "tata-tertib",
    title: "Kehadiran & Ketepatan Waktu",
    highlight: "Hadir maksimal 15 menit sebelum bel masuk.",
    facts: [
      "Keterlambatan lebih dari 3 kali tanpa keterangan akan berdampak pada nilai sikap.",
      "Siswa yang sering tepat waktu terbukti memiliki prestasi akademik lebih tinggi.",
      "Bel masuk sekolah berbunyi pukul 07.00 WIB setiap hari kerja.",
    ],
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
    facts: [
      "Seragam Senin–Selasa: putih-abu. Rabu–Kamis: batik sekolah. Jumat: pramuka.",
      "Siswa diwajibkan menggunakan sepatu hitam polos tanpa motif.",
      "Atribut lengkap meliputi badge OSIS, nama siswa, dan logo sekolah.",
    ],
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
    facts: [
      "Izin ke toilet wajib menggunakan kartu izin yang tersedia di setiap kelas.",
      "Penggunaan ponsel di dalam kelas dilarang kecuali atas izin guru mata pelajaran.",
      "Siswa berdiri dan memberi salam saat guru memasuki dan meninggalkan kelas.",
    ],
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
    facts: [
      "Setiap kelas mendapat jadwal piket harian yang bergilir setiap minggu.",
      "Tersedia tempat sampah terpilah (organik/non-organik) di setiap sudut sekolah.",
      "Program Jumat Bersih diadakan rutin untuk membersihkan seluruh area sekolah.",
    ],
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
    facts: [
      "Sistem poin pelanggaran: 0–25 (peringatan), 26–50 (skors), >50 (dikeluarkan).",
      "Membawa atau mengonsumsi rokok di lingkungan sekolah dikenakan sanksi berat.",
      "Setiap pelanggaran dicatat dalam buku BK dan dilaporkan kepada orang tua.",
    ],
    icon: "shield",
    description:
      "Membawa barang terlarang, melakukan tindakan kekerasan, atau perilaku tidak terpuji lainnya akan dikenakan sanksi bertahap sesuai buku poin pelanggaran sekolah.",
    position: [-9, 0, 10],
    color: "#22d3ee",
  },

  /* ── Budaya Sekolah ──────────────────────────────────────────── */
  {
    id: "bd-1",
    category: "budaya",
    title: "Salam & Sapa",
    highlight: "Senyum, Salam, Sapa, Sopan, Santun.",
    facts: [
      "Budaya 5S diterapkan sejak pukul 06.30 oleh guru piket di gerbang masuk.",
      "Siswa terbiasa berjabat tangan dan mencium tangan guru sebagai bentuk hormat.",
      "5S terbukti menciptakan lingkungan belajar yang lebih positif dan produktif.",
    ],
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
    facts: [
      "Kerja bakti rutin dilaksanakan setiap Jumat pagi sebelum kegiatan belajar dimulai.",
      "Siswa berbagai jurusan berkolaborasi dalam proyek sekolah lintas kelas.",
      "Gotong royong juga diterapkan dalam kegiatan OSIS dan kepanitiaan acara sekolah.",
    ],
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
    facts: [
      "Tersedia lebih dari 15 kegiatan ekstrakurikuler resmi, dari robotika hingga tari tradisional.",
      "Siswa berprestasi di bidang ekskul mendapat pengakuan melalui papan prestasi sekolah.",
      "Ekskul wajib diikuti minimal 1 oleh setiap siswa mulai dari kelas X.",
    ],
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
    facts: [
      "Upacara bendera dilaksanakan setiap Senin pagi dan hari besar nasional.",
      "Petugas upacara dipilih bergilir dari kelas-kelas yang berbeda setiap minggunya.",
      "Siswa diajarkan lagu-lagu nasional dan sejarah bendera Merah Putih.",
    ],
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
    facts: [
      "Setiap tahun sekolah menyelenggarakan Festival Budaya Nusantara antar kelas.",
      "Terdapat program Bahasa Jawa sebagai muatan lokal wajib untuk kelas X dan XI.",
      "Batik hari Rabu menggunakan motif batik khas Sidoarjo yang dipilih OSIS.",
    ],
    icon: "culture",
    description:
      "Sekolah melestarikan budaya lokal melalui kegiatan seni tradisional, bahasa daerah, dan perayaan hari besar budaya Indonesia.",
    position: [9, 0, 10],
    color: "#fbbf24",
  },
];

/** Helpers */

/** Mengembalikan semua item dalam kategori yang sama, diurutkan berdasarkan id */
export function getExhibitsByCategory(
  category: ExhibitCategory
): ExhibitItem[] {
  return museumData.filter((e) => e.category === category);
}

/** Mengembalikan item sebelumnya dalam kategori yang sama */
export function getPrevExhibit(item: ExhibitItem): ExhibitItem | null {
  const peers = getExhibitsByCategory(item.category);
  const idx = peers.findIndex((e) => e.id === item.id);
  return idx > 0 ? peers[idx - 1] : null;
}

/** Mengembalikan item berikutnya dalam kategori yang sama */
export function getNextExhibit(item: ExhibitItem): ExhibitItem | null {
  const peers = getExhibitsByCategory(item.category);
  const idx = peers.findIndex((e) => e.id === item.id);
  return idx !== -1 && idx < peers.length - 1 ? peers[idx + 1] : null;
}
