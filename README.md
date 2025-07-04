# Mini Notion Clone

Aplikasi web catatan berbasis blok dengan fitur mirip Notion. Dibangun dengan React (Vite), Express, Prisma, PostgreSQL, dan Material UI (MUI). Mendukung drag & drop, upload gambar, autentikasi JWT, dan UI modern.

---

## ✨ Fitur Utama
- **Autentikasi JWT** (cookie-based, aman)
- **CRUD Catatan & Blok** (text, checklist, code, image)
- **Editor blok drag & drop** (dnd-kit, urutan catatan & blok bisa diubah)
- **Upload gambar** langsung dari komputer (blok image)
- **Preview gambar** otomatis setelah upload
- **Autosave blok** (perubahan langsung tersimpan)
- **UI modern** dengan Material UI (MUI) & icon SVG custom
- **Sticky header** di editor, tombol icon, checklist modern

---

## 🚀 Instalasi & Menjalankan

### 1. Backend
```sh
cd backend
npm install
npm start
```
- Default port: **4000**
- Endpoint API: `http://localhost:4000/api`
- File upload tersimpan di: `backend/uploads/`
- ENV: Pastikan `DATABASE_URL` PostgreSQL sudah diatur (lihat `.env.example` jika ada)

### 2. Frontend
```sh
cd frontend
npm install
npm run dev
```
- Default port: **5173**
- Base URL API di `src/utils/api.js` harus mengarah ke backend: `http://localhost:4000/api`

---

## 🗄️ Struktur Database (Prisma)
- **User**: id, email, password, notes[]
- **Note**: id, userId, title, orderIndex, blocks[]
- **Block**: id, noteId, type (text, checklist, image, code), content (JSON), orderIndex, parentId (opsional)

---

## 📚 API Utama

### Autentikasi
- `POST /api/auth/register` `{ email, password }`
- `POST /api/auth/login` `{ email, password }` _(JWT cookie)_

### Catatan
- `GET /api/notes` _(list, urut orderIndex)_
- `POST /api/notes` `{ title }`
- `GET /api/notes/:id`
- `PUT /api/notes/:id` `{ title }`
- `DELETE /api/notes/:id`
- `PATCH /api/notes/reorder` `[{ id, orderIndex }, ...]` _(update urutan drag & drop)_

### Blok
- `POST /api/blocks` `{ noteId, type, content, orderIndex }`
- `PUT /api/blocks/:id` `{ content }`
- `DELETE /api/blocks/:id`
- `PATCH /api/blocks/reorder` `[{ id, orderIndex }, ...]`

### Upload Gambar
- `POST /api/upload` _(form-data: file)_
- File dapat diakses di `/uploads/namafile.jpg`

> Semua endpoint (kecuali register/login) butuh autentikasi (JWT via cookie)

---

## 🖱️ Drag & Drop
- Urutan catatan & blok diubah via drag & drop (dnd-kit)
- Urutan disimpan di field `orderIndex` (Note & Block)
- Update urutan: PATCH `/api/notes/reorder` & `/api/blocks/reorder`

---

## 🖼️ Upload & Preview Gambar
- Tambah blok baru, pilih tipe **Image**, pilih file dari komputer
- Preview muncul otomatis, klik **Simpan** untuk menyimpan
- File gambar tersimpan di backend, dapat diakses via URL `/uploads/namafile.jpg`

---

## 💡 UI/UX
- UI modern dengan Material UI (MUI)
- Drag & drop urutan catatan & blok
- Sticky judul & toolbar di editor
- Tombol aksi pakai icon (edit, hapus, simpan, batal)
- Checklist tampil modern (MUI Checkbox)
- Blok text selalu rata kiri
- Branding: judul & favicon custom SVG

---

## 🛠️ Troubleshooting
- **Upload gagal**: pastikan folder `backend/uploads` ada & writable
- **Gambar tidak tampil**: cek URL gambar & backend berjalan
- **Preview tidak muncul**: path gambar harus `/uploads/namafile.jpg`
- **Autentikasi gagal**: cek cookie JWT & baseURL frontend

---

## 📁 Struktur Folder (Ringkas)
```
mini-notion-clone/
  backend/
    prisma/         # Skema & migrasi database
    routes/         # API routes (auth, notes, blocks, upload)
    utils/          # Middleware, helper
    uploads/        # File upload gambar
    index.js        # Entry point backend
    package.json
  frontend/
    src/            # Komponen, pages, utils
    public/         # Favicon, asset publik
    package.json
  README.md
  .gitignore
```

---

## 🤝 Kontribusi & Lisensi
- Bebas digunakan untuk belajar & pengembangan
- Pull request & issue sangat diterima!

---

**By Sulton | Mini-Notion 2025**
