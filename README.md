# Mini Notion Clone

Aplikasi web catatan berbasis blok dengan fitur mirip Notion, menggunakan React (Vite), Express, Prisma, PostgreSQL, dan Chakra UI.

## Fitur
- Autentikasi JWT (cookie-based)
- CRUD catatan dan blok (text, checklist, code, image)
- Editor blok dengan drag & drop (dnd-kit)
- **Upload gambar langsung dari komputer (blok image)**
- Preview gambar otomatis setelah upload
- Autosave blok
- UI modern dengan Chakra UI

## Menjalankan Backend

```sh
cd backend
npm install
npm start
```

> **Catatan:**  
> Folder `backend/uploads` akan otomatis dibuat saat backend dijalankan.  
> Semua file gambar hasil upload akan disimpan di folder ini dan dapat diakses melalui URL `/uploads/namafile.jpg`.

## Menjalankan Frontend

```sh
cd frontend
npm install
npm run dev
```

> **Catatan:**  
> Pastikan baseURL di `src/utils/api.js` mengarah ke backend, misal:  
> `http://localhost:4000/api`

## .gitignore
Pastikan baris berikut ada di `.gitignore`:
```
backend/uploads/
```

## Cara Menambah Blok Gambar
1. Buka editor catatan.
2. Tambah blok baru, pilih tipe **Image**.
3. Pilih file gambar dari komputer.
4. Preview gambar akan muncul otomatis.
5. Klik **Simpan** untuk menyimpan blok gambar.

## Troubleshooting
- Jika upload gambar gagal, pastikan folder `backend/uploads` ada dan dapat ditulis.
- Jika gambar tidak tampil di frontend, pastikan URL gambar valid dan backend berjalan di port yang benar.
- Jika preview gambar tidak muncul, pastikan path gambar diawali `/uploads/` atau URL lengkap.

---

## 🧪 Contoh Testing Endpoint (Postman)

1. **Register**
   - POST `/api/auth/register`
   - Body (JSON): `{ "email": "user@email.com", "password": "password123" }`
2. **Login**
   - POST `/api/auth/login`
   - Body (JSON): `{ "email": "user@email.com", "password": "password123" }`
   - Setelah login, cookie JWT otomatis tersimpan di Postman
3. **CRUD Notes**
   - GET `/api/notes` (list catatan)
   - POST `/api/notes` (buat catatan baru, body: `{ "title": "Judul Catatan" }`)
   - GET `/api/notes/:id` (detail catatan)
   - PUT `/api/notes/:id` (update judul)
   - DELETE `/api/notes/:id` (hapus catatan)
4. **CRUD Blocks**
   - POST `/api/blocks` (buat blok)
   - PUT `/api/blocks/:id` (update blok)
   - DELETE `/api/blocks/:id` (hapus blok)
   - PATCH `/api/blocks/reorder` (reorder blok)

> **Catatan:** Semua endpoint kecuali register/login membutuhkan autentikasi (cookie JWT dari login).

---

## 📁 Struktur Folder (ringkas)
```
mini-notion-clone/
  backend/
    prisma/
    routes/
    utils/
    index.js
    package.json
    ...
  frontend/
    src/
    package.json
    ...
  README.md
  .gitignore
```

---

## 📄 Lisensi & Kontribusi
- Bebas digunakan untuk belajar.
- Pull request & issue sangat diterima!

---
