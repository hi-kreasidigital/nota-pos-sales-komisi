# Nota POS — Sistem Sales & Komisi

Aplikasi web untuk mengelola pendaftaran sales, klien baru, konfirmasi training, klaim komisi, dan pembayaran — dengan login PIN terpisah untuk Admin dan Sales. Dibangun dengan **React + Vite**, data disimpan di **Supabase**.

## 1. Setup Supabase

1. Buat akun & project baru di [supabase.com](https://supabase.com) (gratis).
2. Buka **SQL Editor** di dashboard Supabase → New query → tempel seluruh isi file [`supabase/schema.sql`](./supabase/schema.sql) → klik **Run**.
   Ini akan membuat 3 tabel (`sales`, `transactions`, `settings`) beserta aturan keamanan dasarnya.
3. (Direkomendasikan) Buka **Database → Replication**, aktifkan toggle **Realtime** untuk ketiga tabel di atas — ini yang membuat data admin & sales otomatis sinkron tanpa refresh manual.
4. Buka **Project Settings → API**, salin:
   - `Project URL`
   - `anon public` key

## 2. Setup project di komputer

```bash
git clone <url-repo-kamu>
cd nota-pos-sales-komisi
npm install
cp .env.example .env
```

Buka file `.env`, isi dengan URL & anon key dari langkah 1:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=isi-anon-key-kamu
```

Jalankan mode development:

```bash
npm run dev
```

Buka `http://localhost:5173` — login dengan PIN admin default **`0000`**, lalu segera ganti di tab Pengaturan.

## 3. Publish ke GitHub

```bash
git init
git add .
git commit -m "Setup awal Nota POS Sales & Komisi"
git branch -M main
git remote add origin <url-repo-github-kamu>
git push -u origin main
```

> File `.env` **tidak ikut ter-push** (sudah masuk `.gitignore`) — kredensial Supabase kamu tetap aman dan tidak masuk ke GitHub publik.

## 4. Deploy ke Netlify (alur GitHub → Netlify, auto-deploy)

1. Login ke [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Pilih **GitHub**, otorisasi akses, lalu pilih repo ini.
3. Netlify akan otomatis membaca `netlify.toml` (build command `npm run build`, folder publish `dist`) — biarkan default.
4. Sebelum klik deploy, buka **Environment variables** dan tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (nilainya sama seperti di file `.env` kamu)
5. Klik **Deploy site**. Setiap kali kamu `git push` ke branch `main`, Netlify otomatis build & deploy ulang.

### Alternatif tanpa GitHub (drag & drop / CLI)
Kalau tidak mau pakai GitHub sama sekali:
```bash
npm run build
```
lalu drag folder `dist/` ke [app.netlify.com/drop](https://app.netlify.com/drop), atau pakai `netlify-cli`:
```bash
npm install -g netlify-cli
netlify deploy
```
Environment variable tetap diisi manual lewat dashboard Netlify (Site settings → Environment variables) dengan cara ini.

## 5. Struktur project

```
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
├── .env.example
├── supabase/
│   └── schema.sql          # skema database + RLS policy
└── src/
    ├── main.jsx
    ├── App.jsx              # data layer Supabase + routing peran
    ├── supabaseClient.js
    ├── styles.css
    ├── assets/logo.png
    ├── lib/helpers.js       # format angka/tanggal, WA link, mapping DB
    └── components/
        ├── LoginScreen.jsx
        ├── SalesScreen.jsx
        ├── AdminRingkasan.jsx
        ├── AdminKlaim.jsx
        ├── AdminSales.jsx
        ├── AdminSettings.jsx
        └── DocModal.jsx     # sertifikat & invoice (cetak ke PDF)
```

## 6. Catatan penting

- **WA tidak terkirim otomatis di background.** Setiap trigger (klien baru, sertifikat, klaim komisi) membuka tab WhatsApp dengan pesan siap kirim — tetap perlu menekan kirim satu kali. Otomatisasi penuh butuh WhatsApp Business API resmi + server, di luar cakupan project ini.
- **Keamanan PIN (baca sebelum publish luas):** saat ini validasi PIN dilakukan di browser dengan mengambil seluruh daftar sales (termasuk kolom `pin`) lewat anon key. Ini cocok untuk tim kecil yang saling percaya, tapi **bukan tingkat keamanan enterprise** — siapa pun yang membuka developer tools bisa melihat semua PIN. Untuk produksi yang lebih aman: pindahkan validasi PIN ke Supabase Edge Function agar kolom `pin` tidak pernah dikirim ke browser, atau ganti ke Supabase Auth penuh.
- Sertifikat & invoice dibuat dengan fitur cetak bawaan browser (`window.print()`) — pilih "Simpan sebagai PDF" di dialog cetak untuk mengunduh filenya.
