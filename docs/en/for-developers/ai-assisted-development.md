# AI Assisted Development

Gunakan dokumentasi aktif sebagai konteks sebelum meminta AI menulis kode.
[AGENTS.md](https://github.com/parkisutama/obsidian-unisastra/blob/main/AGENTS.md)
adalah instruksi bersama; CLAUDE.md mengarahkan Claude ke file yang sama.

## Reading order

1. [Development status](../development-status.md): gate dan pekerjaan yang belum divalidasi.
2. [Current state](../current-state.md): implementasi dan identifier kompatibilitas.
3. [Architecture baseline](../reference/code-architecture-baseline.md): tanggung jawab modul.
4. [ADR-001](../reference/decisions/ADR-001-ai-development-context-and-gates.md)
   dan ADR lain yang terkait perubahan.
5. Guide pengguna, spesifikasi terkait, source, dan tests untuk area yang disentuh.

Pilih konteks berdasarkan task. Outliner memakai spesifikasi outliner dan
`src/cm6/outliner/`; release memakai release gates dan `scripts/lib/`.
Dokumen archive dipakai untuk memahami sejarah, lalu diverifikasi terhadap source.

## Development loop

1. Periksa Git status dan pertahankan pekerjaan yang sudah ada.
2. Untuk kebutuhan produk baru, gunakan skill PM; untuk requirement yang belum
   jelas, gunakan `interview-me`. Konfirmasikan intent dan definisi sukses.
3. Buat branch sebelum artefak perencanaan pertama. Lanjutkan branch task yang
   sudah ada; pertahankan pekerjaan lokal.
4. Ikuti `SPECIFY → PLAN → TASKS → IMPLEMENT`, dengan validasi manusia antar
   fase perencanaan. Otorisasi yang sudah eksplisit tidak perlu diminta ulang.
   Catat ADR sebelum mengubah arsitektur atau kontrak kompatibilitas.
5. Pecah task menjadi vertical slices melalui `planning-and-task-breakdown`;
   gunakan `incremental-implementation` untuk menyelesaikan satu slice beserta
   test dan dokumentasinya sebelum berikutnya.
6. Jalankan targeted checks, checkpoint `check`, lalu `pnpm run check:ci`.
7. Perbarui docs yang terdampak dan catat hasil otomatis serta acceptance manual.
8. Review diff dan buat atomic Conventional Commit sesuai ruang lingkup pengguna.

## Strategy, skills, and artifacts

AGENTS.md menentukan pemilihan skill per kondisi, outcome yang harus dihasilkan,
dan aturan sebelum refactor atau shipping. Baca SKILL.md skill yang dipakai;
daftar skill di panduan bukan mekanisme instalasi atau invocation otomatis.

Strategi dimulai dari positioning README dan workflow pengguna Unisastra.
Bandingkan manfaat, risiko regresi, compatibility, effort, dan dependency sebelum
merekomendasikan prioritas kepada maintainer. Pisahkan implementasi yang ada,
parsial, belum ada, dan gate yang benar-benar ditegakkan.

Untuk task terencana baru, konvensi artefak adalah
`docs/specs/<slug>/{spec,plan,tasks}.md`, dibuat saat task memerlukannya.
Dokumen task aktif yang sudah ada tetap digunakan. Tautkan acceptance dengan
test/QA dan ADR; setelah shipped, arsipkan artefak selesai dan perbarui link.
Current state mencatat implementasi; development status mencatat bukti readiness.

Contoh prompt:

```text
Baca AGENTS.md dan dokumentasi aktif yang terkait outliner.
Periksa implementasi dan tests sebelum mengubahnya.
Tujuan: [perilaku yang diinginkan]. Acceptance: [skenario dan hasil].
Pertahankan command IDs, settings, dan pekerjaan lokal yang sudah ada.
Implementasikan perubahan, jalankan QA, update docs, lalu laporkan
apa yang lolos, gagal, dan belum diuji di Obsidian.
```

## Local hooks and CI

`pnpm install` mengaktifkan Husky melalui `prepare`. Pada checkout lama,
jalankan `pnpm run prepare` lalu periksa `git config --get core.hooksPath`;
hasil yang diharapkan adalah `.husky/_`.

- Pre-commit: `pnpm run check`, tanpa autofix atau staging otomatis.
- Commit-msg: commitlint, contoh `docs(ai): document development context`.
- CI QA: `check:ci`, termasuk test, build, verifikasi artefak, dan build docs.
- CI commitlint: seluruh commit pada pull request.

Jalankan `pnpm run fix` secara eksplisit bila diperlukan dan review diff.
Hook dapat dilewati; hasil hook lokal bukan bukti hasil CI. Conventional Commits
menguji format pesan, sementara ukuran atomic commit ditinjau manusia.

Build docs memeriksa situs dan link lokal, bukan kebenaran isi. Akurasi docs,
acceptance Obsidian desktop/mobile/popout, dan branch protection merupakan gate
terpisah yang harus dicatat dengan jujur.
