# Mini Notion Clone

Aplikasi pencatatan berbasis web dengan sistem blok seperti Notion. Backend menggunakan Express, Prisma, dan PostgreSQL. Frontend menggunakan React.

---

## 🚀 Cara Menjalankan Project

### 1. Jalankan Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
node index.js
# atau
npx nodemon index.js
```
Backend berjalan di: `http://localhost:4000`

### 2. Jalankan Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend berjalan di: `http://localhost:5173`

### 3. Testing
- Buka `http://localhost:5173` di browser.
- Register user baru, login, buat catatan, tambah/edit/hapus blok, drag & drop blok, dll.

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
