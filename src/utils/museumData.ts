export type ExhibitCategory = "tata-tertib" | "budaya";

export interface ExhibitItem {
  id: string;
  category: ExhibitCategory;
  title: string;
  description: string;
  /** Posisi pedestal di dalam ruangan [x, y, z] */
  position: [number, number, number];
  /** Warna aksen panel/pedestal (hex) */
  color: string;
}

export const museumData: ExhibitItem[] = [
  {
    id: "tt-1",
    category: "tata-tertib",
    title: "Kehadiran & Ketepatan Waktu",
    description:
      "Siswa wajib hadir di sekolah tepat waktu, maksimal 15 menit sebelum bel masuk berbunyi. Keterlambatan tanpa keterangan yang sah akan dikenakan sanksi sesuai tata tertib sekolah.",
    position: [-9, 0, -6],
    color: "#3b82f6",
  },
  {
    id: "tt-2",
    category: "tata-tertib",
    title: "Seragam & Kerapian",
    description:
      "Siswa wajib mengenakan seragam sesuai jadwal yang ditentukan, lengkap dengan atribut sekolah, rapi, dan sopan selama berada di lingkungan sekolah.",
    position: [-9, 0, -2],
    color: "#3b82f6",
  },
  {
    id: "tt-3",
    category: "tata-tertib",
    title: "Etika di Kelas",
    description:
      "Siswa diwajibkan menjaga ketenangan, menghormati guru dan teman, serta aktif mengikuti kegiatan belajar mengajar di dalam kelas.",
    position: [-9, 0, 2],
    color: "#3b82f6",
  },
  {
    id: "tt-4",
    category: "tata-tertib",
    title: "Kebersihan Lingkungan",
    description:
      "Setiap siswa bertanggung jawab menjaga kebersihan kelas, koridor, dan seluruh area sekolah, termasuk membuang sampah pada tempatnya.",
    position: [-9, 0, 6],
    color: "#3b82f6",
  },
  {
    id: "tt-5",
    category: "tata-tertib",
    title: "Larangan & Sanksi",
    description:
      "Membawa barang terlarang, melakukan tindakan kekerasan, atau perilaku tidak terpuji lainnya akan dikenakan sanksi bertahap sesuai buku poin pelanggaran sekolah.",
    position: [-9, 0, 10],
    color: "#3b82f6",
  },
  {
    id: "bd-1",
    category: "budaya",
    title: "Salam & Sapa",
    description:
      "Budaya 5S (Senyum, Salam, Sapa, Sopan, Santun) diterapkan setiap hari sebagai bentuk penghormatan antarwarga sekolah.",
    position: [9, 0, -6],
    color: "#f59e0b",
  },
  {
    id: "bd-2",
    category: "budaya",
    title: "Gotong Royong",
    description:
      "Sekolah menjunjung tinggi nilai gotong royong melalui kegiatan kerja bakti rutin dan kolaborasi antar siswa dalam berbagai kegiatan.",
    position: [9, 0, -2],
    color: "#f59e0b",
  },
  {
    id: "bd-3",
    category: "budaya",
    title: "Ekstrakurikuler & Prestasi",
    description:
      "Beragam kegiatan ekstrakurikuler tersedia untuk mengembangkan bakat siswa, mulai dari bidang akademik, seni, hingga olahraga.",
    position: [9, 0, 2],
    color: "#f59e0b",
  },
  {
    id: "bd-4",
    category: "budaya",
    title: "Upacara & Nasionalisme",
    description:
      "Upacara bendera rutin setiap Senin menumbuhkan rasa cinta tanah air dan disiplin bagi seluruh warga sekolah.",
    position: [9, 0, 6],
    color: "#f59e0b",
  },
  {
    id: "bd-5",
    category: "budaya",
    title: "Kearifan Lokal",
    description:
      "Sekolah melestarikan budaya lokal melalui kegiatan seni tradisional, bahasa daerah, dan perayaan hari besar budaya Indonesia.",
    position: [9, 0, 10],
    color: "#f59e0b",
  },
];
