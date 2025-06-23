# Mini Notion Clone

Aplikasi pencatatan berbasis web dengan sistem blok seperti Notion. Backend menggunakan Express, Prisma, dan PostgreSQL.

---

## 🚀 Cara Menjalankan Project Backend

### 1. **Clone repository**
```bash
# (jika belum)
git clone https://gitlab.com/sultonsabillar/mini-notion-clone.git
cd mini-notion-clone/backend
```

### 2. **Siapkan Database PostgreSQL**
- Pastikan sudah ada database PostgreSQL yang berjalan
- Buat database baru, misal: `mini_notion_clone`

### 3. **Salin dan edit file environment**
```bash
cp .env.example .env
```
- Edit file `.env` sesuai konfigurasi database Anda:
  ```env
  DATABASE_URL="postgresql://username:password@localhost:5432/mini_notion_clone"
  JWT_SECRET="your_jwt_secret"
  ```

### 4. **Install dependency**
```bash
npm install
```

### 5. **Migrasi database**
```bash
npx prisma migrate dev --name init
```

### 6. **Generate Prisma Client** (opsional, biasanya otomatis saat migrate)
```bash
npx prisma generate
```

### 7. **Jalankan server backend**
```bash
node index.js
# atau
npx nodemon index.js
```

Server akan berjalan di `http://localhost:4000`

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

## 📁 Struktur Folder Backend (ringkas)
```
backend/
  ├── prisma/
  │     └── schema.prisma
  ├── routes/
  │     ├── auth.js
  │     ├── notes.js
  │     └── blocks.js
  ├── utils/
  │     └── authMiddleware.js
  ├── index.js
  ├── package.json
  ├── .env.example
  └── ...
```

---
