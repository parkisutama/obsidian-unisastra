# Branching conventions

Dokumen ini adalah referensi cepat untuk penamaan branch dan kapan branch tersebut dipakai.

## Branch utama

- `main`: source of truth yang siap untuk integrasi dan release.

## Branch kerja yang disarankan

- `feature/<slug>`: penambahan capability atau perilaku baru.
- `fix/<slug>`: perbaikan bug.
- `refactor/<slug>`: perombakan internal tanpa target perilaku baru.
- `docs/<slug>`: perubahan dokumentasi.
- `chore/<slug>`: tooling, dependency, atau housekeeping.
- `release/<version>`: metadata release dan changelog jika release perlu
  disiapkan di branch terpisah.

## Contoh

- `feature/outliner-breadcrumb-click`
- `fix/typewriter-padding-reset`
- `refactor/settings-schema-cleanup`
- `docs/sdlc-foundation`
- `chore/update-biome-config`
- `release/1.2.3`

## Aturan praktis

- Satu branch untuk satu tema perubahan.
- Jangan campur pekerjaan fitur dengan release metadata.
- Jangan commit versi release baru di branch feature kecuali branch itu memang sedang ditutup untuk release.
- Untuk perubahan DX/release automation, gunakan `chore/<slug>` kecuali branch
  itu hanya berisi metadata versi final.

## Kapan membuat branch baru

Buat branch baru jika:

- ruang lingkup berubah cukup jauh,
- bugfix mendesak harus dipisahkan dari feature yang masih berjalan,
- atau Anda butuh review yang lebih mudah dibaca.
