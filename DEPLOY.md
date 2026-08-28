# Deploy ke Vercel + Prisma Postgres

Kode sudah disiapkan (schema `postgresql`, migration `prisma/migrations/0_init`,
build script menjalankan `prisma migrate deploy`). Yang di bawah ini adalah
langkah yang harus **kamu** lakukan sendiri karena butuh login akun & kredensial.

## 1. Buat database Prisma Postgres

1. Buka https://console.prisma.io -> **New project** -> pilih **Prisma Postgres**,
   pilih region terdekat (mis. `ap-southeast-1` Singapura).
2. Setelah jadi, buka tab **Database -> Connect**.
3. Salin **connection string** yang berformat `postgresql://...` (label
   "Direct connection" / TCP). Jangan yang `prisma+postgres://`.

## 2. Jalankan migration + seed ke database itu (sekali saja)

Di folder ini, isi `.env` dengan connection string tadi lalu:

```bash
npm install
npm run db:deploy      # buat semua tabel (apply prisma/migrations)
npm run db:seed        # isi 24 gerakan + 6 hari PPL
```

Cek dengan `npm run db:studio` kalau mau lihat isinya.

## 3. Push ke GitHub

```bash
git remote add origin https://github.com/<user>/workout-web.git
git push -u origin main
```

## 4. Import ke Vercel

1. https://vercel.com/new -> pilih repo `workout-web`.
2. Framework otomatis terdeteksi **Next.js**. Jangan ubah build command
   (sudah di `package.json`: `prisma generate && prisma migrate deploy && next build`).
3. **Environment Variables** -> tambah:
   - `DATABASE_URL` = connection string dari langkah 1
   - set untuk environment **Production** (dan **Preview** kalau kamu pakai
     preview deployment).
4. **Deploy**.

> Alternatif: di dashboard Vercel project -> **Storage** -> **Marketplace** ->
> **Prisma Postgres**. Ini otomatis membuat DB dan mengisi `DATABASE_URL` untuk
> semua environment. Kalau pakai ini, langkah 1 & env var manual bisa dilewati,
> tapi `npm run db:seed` tetap perlu dijalankan sekali (pakai string yang sama
> di `.env` lokal).

## Update schema nanti

```bash
# ubah prisma/schema.prisma, lalu:
npm run db:migrate -- --name nama_perubahan   # buat migration baru + apply lokal
git add -A && git commit -m "db: ..." && git push
```

Vercel akan menjalankan `prisma migrate deploy` otomatis saat build berikutnya.

## Catatan

- `npm run build` sengaja memanggil `prisma migrate deploy`, jadi butuh
  `DATABASE_URL` yang valid saat build. Untuk kerja lokal pakai `npm run dev`.
- `.env` tidak masuk git (lihat `.gitignore`). Template ada di `.env.example`.
- SQLite lama (`prisma/dev.db`) sudah tidak dipakai, aman dihapus.
