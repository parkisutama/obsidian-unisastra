# Commit, push, and release a change

Dokumen ini adalah prosedur praktis setelah perubahan kode atau dokumentasi sudah siap direview.

## 1. Pastikan branch kerja benar

```bash
git status --short --branch
```

Pastikan Anda tidak sedang bekerja langsung di `main`, kecuali memang sedang melakukan release metadata final.

## 2. Review perubahan sebelum commit

```bash
git diff
git status --short
```

Pisahkan commit berdasarkan tema perubahan:

- `fix:` untuk perbaikan perilaku plugin.
- `docs:` untuk dokumentasi.
- `chore:` untuk tooling, konfigurasi, atau housekeeping.
- `chore(release):` untuk bump versi, changelog, dan tag release.

Jangan campur release metadata dengan feature atau bugfix biasa.

## 3. Jalankan QA sebelum commit

```bash
pnpm run verify
```

Jika command gagal karena pnpm store lokal, perbaiki environment pnpm terlebih dahulu. Jangan bypass gate ini untuk perubahan yang akan masuk release.

## 4. Buat atomic commit

Contoh commit per tema:

```bash
git add src/capabilities/commands/writing-focus/writing-focus.ts \
  src/capabilities/features/hemingway-mode/hemingway-mode.ts \
  src/cm6/plugin.ts
git commit -m "fix(editor): correct popout document handling"

git add docs
git commit -m "docs: document commit push and release workflow"
```

Jika ada perubahan pnpm atau workflow:

```bash
git add package.json pnpm-workspace.yaml
git commit -m "chore(build): move pnpm approvals to workspace config"
```

## 5. Push branch kerja

```bash
git push -u origin <branch-name>
```

Setelah branch dipush, cek hasil GitHub Actions `Check`.

## 6. Merge ke main

Setelah review dan check hijau:

```bash
git switch main
git pull --ff-only
git merge --ff-only <branch-name>
git push origin main
```

Jika branch sudah divergen, selesaikan lewat PR atau merge commit sesuai kebutuhan review.

## 7. Siapkan release patch

Untuk bugfix kecil, gunakan patch version. Contoh dari `1.0.0` ke `1.0.1`.

Edit:

- `package.json`: naikkan `version`.
- `CHANGELOG.md`: tambahkan heading `## 1.0.1`.

Jangan edit `manifest.json` dan `versions.json` manual kecuali Anda tahu perlu melakukannya; `pnpm run release` akan menyinkronkannya.

## 8. Buat release lokal

```bash
pnpm run release
```

Script akan menjalankan gate, membuat commit release, dan membuat tag lokal dengan nama versi.

## 9. Push commit release dan tag

```bash
git push origin main --follow-tags
```

Push tag semver seperti `1.0.1` akan memicu workflow GitHub release.

## 10. Verifikasi release

Cek GitHub release berisi:

- `unisastra.zip`
- `dist/main.js`
- `dist/manifest.json`
- `dist/styles.css`

Lalu cek BRAT atau instalasi manual bila release perlu divalidasi dari sisi pengguna.
