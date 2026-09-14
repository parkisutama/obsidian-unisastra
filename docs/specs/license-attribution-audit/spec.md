# SPEC: License & attribution audit

## Masalah

MD Writer mengintegrasikan kode dan konsep dari sepuluh plugin Obsidian pihak
ketiga. Audit sumber (bukan asumsi) menemukan dua gap nyata:

1. `LICENSE` root menyatakan seluruh project MIT, tapi
   [writing-focus.ts](../../../src/capabilities/commands/writing-focus/writing-focus.ts)
   genuinely mem-port struktur dan logika dari
   [ryanpcmcquen/obsidian-focus-mode](https://github.com/ryanpcmcquen/obsidian-focus-mode),
   yang berlisensi **MPL-2.0** (diverifikasi langsung dari `LICENSE` di branch
   `master` repo tersebut), bukan MIT. Diff manual method-by-method
   (`storeSplitsValues`, `collapseSplits`, `restoreSplits`,
   `removeExtraneousClasses`, `enableFocusMode`, `disableFocusMode`,
   `toggleFocusMode`, properti `focusModeActive`/`maximizedClass`/
   `focusModeClass`) menunjukkan port satu-satu, bukan sekadar terinspirasi.
   MPL-2.0 adalah file-level copyleft: mengklaim file ini MIT tanpa exception
   adalah representasi lisensi yang salah.
2. Empat file yang benar-benar mengadaptasi kode (bukan hanya terinspirasi)
   belum punya atribusi source-level yang lengkap (header pin-commit + file
   lisensi + build banner), berbeda dengan standar yang sudah ditegakkan untuk
   Floaty Toolbar
   ([reorder.ts](../../../src/components/floaty-toolbar/reorder.ts),
   [license-banner.ts](../../../scripts/lib/license-banner.ts)).

Referensi awal yang diberikan pengguna (`FINAL-plugins-and-licenses-reference.md`
dkk. dari sesi lain, disimpan di scratchpad sesi tersebut) sebagian **basi atau
salah** dan tidak dipakai langsung — semua klaim di spec ini sudah diverifikasi
ulang terhadap source code dan repo upstream asli:

- Klaim "README tidak punya Acknowledgements / MonoNote hilang dari README" —
  **salah**. `README.md` sudah punya section `## Acknowledgements` lengkap
  termasuk MonoNote.
- Klaim "hemingway-mode.ts, show-whitespace.ts, typewriter-offset-calculator.ts
  perlu header 'ADAPTED FROM'" — **salah**. Diff terhadap upstream menunjukkan
  arsitektur berbeda total (CM6 native API vs upstream CM5 `showInvisibles`,
  keydown-blocking vs upstream `StateField`/`ViewPlugin`); ini genuinely
  inspirasi, bukan adaptasi kode.
- Klaim "mononote.ts belum ada attribution header" — **salah**, sudah ada
  sejak sebelumnya.

## Scope

### In scope

1. **MPL-2.0 dual-license handling** untuk `writing-focus.ts` dan file terkait
   di `src/capabilities/commands/writing-focus/`:
   - Tambah EXCEPTION clause di `LICENSE` root.
   - Tambah `licenses/writing-focus-MPL2.0.txt` (teks lengkap MPL-2.0 dari
     upstream, bukan parafrase).
   - Upgrade header di `writing-focus.ts`/`index.ts` ke pola penuh (commit
     hash upstream yang dipin, copyright line, pointer ke file lisensi).
   - Update build tooling (`scripts/lib/license-banner.ts` atau modul baru
     serupa + `artifact-verification.ts`) agar notice MPL ikut ter-embed ke
     `dist/main.js` dan diverifikasi, sama seperti pola Floaty Toolbar.
2. **Upgrade atribusi mononote.ts** (genuine code adaptation, MIT) ke pola
   penuh: commit hash upstream yang dipin di header, file
   `licenses/mononote-MIT.txt`.
3. **Tambah catatan "inspired by" ringan** (bukan pola "adapted from" penuh,
   karena tidak ada kode yang dikutip) untuk:
   - `hemingway-mode.ts` → jobedom/obsidian-hemingway-mode
   - `show-whitespace.ts` (dan file terkait di `src/cm6/show-whitespace.ts`)
     → deathau/cm-show-whitespace-obsidian
   - `typewriter-offset-calculator.ts`, `typewriter-scroll.ts` →
     deathau/cm-typewriter-scroll-obsidian (selaras dengan narasi README
     "started as a fork... completely restructured")
   - `outliner-focus.ts`, `outliner-unfocus.ts`, `click-on-bullet.ts` →
     vslinko/obsidian-zoom
4. **README.md**: tambah catatan lisensi MPL-2.0 untuk Writing Focus di
   section Acknowledgements yang sudah ada (bukan membuat ulang section).
5. **Dokumentasi referensi baru**: `docs/reference/plugin-attribution-audit.md`
   berisi tabel status akhir (menggantikan file-file scratchpad sesi lain
   yang tidak pernah masuk repo), menjadi satu sumber kebenaran untuk audit
   ini.

### Out of scope

- Rewrite `writing-focus.ts` dari nol (opsi ditolak pengguna; dual-license
  dipilih).
- Mengubah behavior/fitur apa pun — ini murni perubahan atribusi dan
  dokumentasi, tidak menyentuh logic runtime.
- Audit lisensi dependency npm (`pnpm-lock.yaml`) — di luar cakupan yang
  diminta pengguna kali ini.
- Membuat `AUTHORS.md` terpisah — README Acknowledgements sudah menjadi single
  source of truth user-facing; tidak menduplikasi.

## Acceptance criteria

- [ ] `LICENSE` root punya EXCEPTION clause yang menyebut file writing-focus
      sebagai MPL-2.0, dengan copyright ryanpcmcquen yang akurat.
- [ ] `licenses/writing-focus-MPL2.0.txt` berisi teks MPL-2.0 lengkap yang
      identik dengan upstream.
- [ ] `licenses/mononote-MIT.txt` berisi teks MIT lengkap upstream, dengan
      copyright line yang benar (`Copyright (c) 2023-present Carlo Zottmann`).
- [ ] Header di `writing-focus.ts` dan `mononote.ts` mengikuti pola
      `reorder.ts`: ringkasan, URL + file upstream, commit hash yang dipin,
      copyright line, pointer ke file lisensi, daftar perbedaan deliberate.
- [ ] `dist/main.js` hasil build memuat banner MPL untuk writing-focus,
      diverifikasi otomatis oleh `verify:artifacts` seperti pola Floaty
      Toolbar (tidak silently hilang saat minify/refactor).
- [ ] 6 file "inspired by" (hemingway-mode, show-whitespace x2,
      typewriter-offset-calculator, typewriter-scroll, outliner-focus,
      outliner-unfocus, click-on-bullet) punya komentar satu-dua baris yang
      jujur — "konsep terinspirasi, bukan port kode" — tanpa klaim "adapted
      from" yang berlebihan.
- [ ] README Acknowledgements tetap satu section (tidak diduplikasi), hanya
      ditambah catatan lisensi MPL-2.0 untuk Writing Focus.
- [ ] `docs/reference/plugin-attribution-audit.md` berisi tabel akhir yang
      akurat (bukan salinan scratchpad basi) dan ditautkan dari
      `docs/for-developers/documentation-guidelines.md` index jika relevan.
- [ ] `pnpm run check:ci` lulus (termasuk `lint:md` untuk dokumen baru,
      `verify:artifacts` untuk banner baru).
- [ ] Tidak ada perubahan behavior/test regression — hanya komentar, file
      lisensi baru, `LICENSE`, README, dan dokumentasi.

## Kontrak kompatibilitas

- Tidak ada perubahan command ID, settings key, view type, atau format
  Markdown vault. Perubahan murni non-runtime (komentar, file teks, docs).
- `dist/main.js` bertambah satu banner comment lagi (MPL), tidak mengubah
  perilaku plugin.
