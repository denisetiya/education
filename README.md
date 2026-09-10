# GeoEducation

Platform pembelajaran untuk guru dan siswa: kelas, kurikulum modular, materi interaktif, latihan soal, forum, dan leaderboard — dalam satu workspace.

## Fitur Utama

- **Manajemen kelas** — join code, enrollment, pengaturan progresi (sequential/free), XP multiplier.
- **Penyusun kurikulum** (`/teacher/curriculum`) — buat modul, drag-drop materi **dan latihan interaktif** ke dalam modul. Setiap latihan ditandai kelas asal, status draft, dan tingkat kesulitan.
- **Materi multi-tipe** — artikel, video, e-book/PDF, dan kuis dengan builder soal (pilihan ganda, benar-salah, jawaban singkat).
- **Latihan interaktif** — builder latihan per kelas (geometri, kalkulasi, canvas, multi-soal) dengan review & penilaian guru.
- **Evaluasi terhubung** — materi bisa ditautkan ke satu evaluasi (quiz **atau** latihan interaktif) lewat satu dropdown di editor materi; siswa diarahkan mengerjakannya setelah selesai membaca.
- **Perjalanan belajar siswa** — peta modul per kelas; urutan materi + latihan dengan locking pada mode sequential, progres dihitung dari materi dan latihan.
- **Forum, leaderboard, badge, dan analitik** kelas.

## Struktur Repo

```
backend/    Express 5 + Prisma (SQLite) — REST API di port 3001
frontend/   React + TypeScript + Vite
desktop/    Wrapper desktop (Tauri) untuk build aplikasi
docs/       Dokumentasi deployment
```

## Menjalankan Development

Prasyarat: Node.js, pnpm.

```bash
pnpm install

# seed database dev (opsional, me-reset data)
pnpm seed

# backend API (port 3001)
pnpm --filter backend dev

# frontend web (Vite)
pnpm --filter frontend dev

# atau desktop app
pnpm desktop:dev
```

Backend membaca `backend/.env`:

```
DATABASE_URL=file:./dev.db
# JWT_SECRET wajib diisi saat produksi
```

### Akun Seed

| Role   | Email          | Password    |
| ------ | -------------- | ----------- |
| Admin  | admin@geo.edu  | Admin12345  |
| Guru   | guru@geo.edu   | Guru12345   |
| Wali   | wali@geo.edu   | (sesuai seed) |
| Siswa  | nisa@siswa.edu | Siswa12345  |

## Migrasi Database

Skema Prisma berada di `backend/prisma/schema.prisma`. Migrasi baru diterapkan otomatis saat deploy; secara lokal:

```bash
cd backend
npx prisma migrate dev --name <nama_migrasi>
```

## Deploy

Deploy memakai GitHub Actions → GHCR → Docker Compose di VPS dengan Cloudflare Tunnel. Lihat [docs/deployment.md](docs/deployment.md).
