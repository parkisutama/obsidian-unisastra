# Spec: block ID dan fold persistence

Status: Accepted untuk B01–B07, D1–D6, dan scope awal, 2026-09-27.
Maintainer memilih "Buat spesifikasi implementasi terpisah" untuk R8 pada
[audit performa](../performance-code-quality/spec.md). Pilihan tersebut
mengotorisasi spec ini. Maintainer kemudian menyetujui paket rekomendasi dan
scope secara eksplisit. [Plan](./plan.md) kemudian disetujui melalui "lanjut ke
task breakdown"; [tasks](./tasks.md) kemudian accepted untuk implementasi.
Keputusan tambahan B02: "Izinkan auto-ID pada fold native apa pun";
lihat [ADR-004](../../en/reference/decisions/ADR-004-fold-native-effects.md).

## Masalah dan baseline sebelum implementasi

Penulis outliner membutuhkan referensi blok yang stabil serta fold yang kembali
sesuai sesi sebelumnya, tanpa selection berpindah atau isi catatan berubah diam-diam.
Saat ini pengaturan hide IDs, auto-generate on fold, dan persist fold sudah tersedia,
tetapi behavior-nya belum terhubung ke registrasi editor.

- `src/cm6/outliner/block-id.ts` menyediakan command insert dan helper hider;
  command manual sudah digunakan, helper hider belum diregistrasikan.
- `src/cm6/outliner/fold-persist.ts` belum diregistrasikan. Capture helper belum
  membaca fold state aktual dan restore hanya memindahkan selection, sehingga
  bukan implementasi yang dapat langsung diaktifkan.
- Settings existing: `blockId.isBlockIdEnabled`,
  `blockId.isAutoGenerateOnFoldEnabled`, `blockId.isHideIdsInLivePreviewEnabled`,
  `foldPersist.isFoldPersistEnabled`, dan `foldPersist.foldState`.
- Fold state existing berbentuk record file path → block ID → boolean.
  Sidebar collapse state berbeda dan tidak boleh digunakan sebagai fold editor.

## Outcome dan scope

Sebagai penulis, saya dapat membuat ID stabil untuk item list, menyembunyikan
suffix ID hanya pada Live Preview, serta membuka file dengan fold item list
yang tersimpan. Sebagai pengguna yang mematikan fitur, saya mempertahankan ID
dan isi catatan; fitur berhenti membuat write atau restore baru.

Scope pertama: item list Markdown dalam editor CM6 utama desktop/popout
dan mobile yang API fold-nya dapat diverifikasi. Heading fold, Canvas/embedded
editor, Reading Mode, serta sinkronisasi collapse sidebar tidak termasuk scope
pertama. Scope yang disetujui bukan klaim dukungan yang sudah diimplementasikan.

## Kebutuhan dan acceptance

| ID | Perilaku | Acceptance |
| --- | --- | --- |
| B01 | Hide IDs berlaku hanya di Live Preview ketika toggle terkait aktif. | Source mode dan Markdown tersimpan tetap menampilkan/memuat ID. Pindah mode, scroll, edit, undo dan disable memperbarui dekorasi tanpa menghapus karakter atau merusak selection. |
| B02 | Auto-generate saat fold native item list tanpa ID dan opsi aktif, baik oleh pengguna maupun plugin lain. | ID existing tidak diganti, collision dalam file dicegah; restore internal MD Writer dan undo/redo tidak membuat ID. Tidak menulis saat Reading Mode, unsupported editor, atau write guard menolak. |
| B03 | Persist mencatat fold aktual berdasarkan file milik editor pemicu. | Fold/unfold nested items terwakili benar; switch file selama debounce tidak menulis state ke file lain. Perubahan selection atau effect yang kebetulan punya from/to tidak dianggap fold. |
| B04 | Restore memulihkan fold tanpa navigasi selection atau write Markdown. | Reopen file mengembalikan range berdasarkan ID yang masih ada; cursor/scroll/active pane tidak dipindahkan sebagai cara melakukan fold. IDs hilang/duplikat tidak diarahkan ke item yang keliru. |
| B05 | Disable/unload menghentikan capture/restore dan membebaskan resource. | Tidak ada dispatch/write tertunda sesudah disable. ID yang pernah dibuat tetap ada. Tidak melakukan restore pada editor yang sudah berganti file atau dihancurkan. |
| B06 | Settings dan identitas legacy dipertahankan. | Tidak mengganti command IDs, syntax `^id`, frontmatter atau settings keys. Jika perlu state versioning, migrasi additive didokumentasikan melalui ADR sebelum implementasi. |
| B07 | Biaya capture/restore terikat pada event fold dan file relevan. | Tidak ada polling atau full-document scan setiap keystroke; debounce per editor/file dan skip persist jika state sama. Burst fold tidak menimbulkan save/restore feedback loop. |

Generate manual/copy link/embed harus tetap kompatibel dengan behavior existing.
Penerapan master toggle terhadap command manual belum boleh berubah tanpa D1.
Auto-generation berarti menulis Markdown dan harus eksplisit opt-in; toggle
persist sendiri tidak otomatis mengotorisasi pembuatan ID.

## Keputusan disetujui — 2026-09-27

| ID | Pertanyaan | Keputusan accepted dan trade-off |
| --- | --- | --- |
| D1 | Apakah master block ID juga mematikan command manual? | Pertahankan command manual existing; master mengendalikan behavior otomatis. Ini menghindari perubahan command yang sudah dipakai, tetapi label master perlu penjelasan. |
| D2 | Bagaimana persist untuk item tanpa ID saat auto-generate mati? | Hanya persist item ber-ID; tidak membuat ID implisit. Lebih aman untuk Markdown, dengan coverage persist terbatas. |
| D3 | Bagaimana dua pane file yang sama memiliki fold berbeda? | Efek fold native terbaru di luar restore internal menjadi acuan reopen; jangan sinkronkan pane lain. Revision pada waktu aksi mencegah capture terlambat menimpa aksi terbaru. |
| D4 | Apa yang dilakukan terhadap fold existing ketika fitur dimatikan? | Pertahankan fold saat itu dan data tersimpan; hentikan capture/restore. Tidak unfold massal atau menghapus ID. |
| D5 | Bagaimana state saat rename/delete atau ID duplikat? | Pindahkan key pada rename, buang state file pada delete, lewati ID ambigu. Jangan mengubah teks untuk memperbaiki ID otomatis di luar aksi B02. |
| D6 | Bagaimana undo untuk ID yang dibuat saat folding? | Satu aksi ID insertion yang dapat di-undo; undo tidak segera memasukkan ulang ID lewat callback fold. Detail grouping perlu probe native CM6/Obsidian. |

D1–D6 dan scope platform disetujui melalui jawaban maintainer
"Setujui paket rekomendasi dan scope". Plan dan tasks kemudian disetujui terpisah.

## Non-goals

- Bulk ID migration, auto-ID seluruh vault, penghapusan ID existing, atau perubahan
  format Markdown untuk keperluan persistence.
- Mengganti fold bawaan Obsidian, mengubah navigasi outliner, atau mencampurkan
  sidebar collapse state dengan editor fold state.
- Dukungan universal versi Obsidian tanpa verifikasi API, telemetry remote,
  framework baru, atau deployment implisit ke vault pengguna.

## Bukti sebelum implementasi dan QA

PLAN harus memverifikasi API fold capture/restore dan mapping editor → file pada
versi host target; jangan mengandalkan nama userEvent atau bentuk effect generik.
Tentukan guard Source/Live Preview, nested fold, outliner focused range, Hemingway,
unsupported editors, pending syntax tree, serta compatibility dengan fold bawaan.
Perubahan schema/API/dependency direction memerlukan ADR sebelum implementasi.

Regression otomatis: real fold effects/ranges, ID collision, nested fold/unfold,
multi-pane same file, switch file sebelum debounce, rename/delete, missing/duplicate
ID, malformed persisted state, enable/disable/unload, undo/redo dan write refusal.
Browser QA: visible-range decoration dan selection di suffix ID. Native QA:
reopen file/app, fold nested, popout, mobile, scroll/cursor tetap, dan disable plugin.

Ukuran keberhasilan: nol write Markdown saat restore/hide, nol resource/callback
setelah disposal, tidak ada perubahan isi selain insertion yang eksplisit,
fold state tersimpan/terpulihkan sesuai B03/B04, dan tidak ada pekerjaan periodik
saat idle. Build/test saja tidak menutup acceptance native.

Progres implementasi dan batas native QA tercatat di [tasks](./tasks.md).
