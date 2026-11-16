# Audit keamanan Unisastra — 16 November 2026

## Status dan ringkasan

**Audit sumber selesai ditelaah; gate formal audit belum lengkap.**
Tidak ada kerentanan yang berhasil dikonfirmasi dalam penelaahan ini.
Lima observasi penguatan di bawah memiliki bukti sumber dan rekomendasi,
tetapi tidak membuktikan eksploitasi atau pelanggaran wewenang.
Hasil ini bukan pernyataan bahwa plugin bebas kerentanan.

| Metadata | Nilai |
| --- | --- |
| Repo | `obsidian-unisastra` |
| Commit sumber | `704fc3a16455d2c16c153060e5901deec681a688` |
| Branch laporan | `codex/security-audit-2026-11-16` |
| Versi package/manifest | `0.0.1` |
| Worktree sebelum audit | Bersih |
| Profil | Standard; penelaahan sumber dengan batas eksekusi |
| Cakupan | Runtime plugin, jalur input, settings, editor, tooling lokal, CI/release, manifest/lockfile dependency |
| Kerentanan terkonfirmasi | 0 |
| Kandidat kerentanan yang menunggu validasi | 0 |
| Observasi penguatan | 5 |
| Batas penting | Rendering host, advisory dependency terbaru, kontrol GitHub, dan runtime belum diverifikasi |

Penelaahan menelusuri input menuju sink dan mencari aktor dengan wewenang
lebih rendah, kontrol yang dilanggar, serta dampak terhadap sumber daya lain.
Kesalahan editing oleh pemilik vault, kurangnya best practice, dan dugaan
perilaku host tidak otomatis dihitung sebagai kerentanan.
Prioritas P1/P2/P3 di sini adalah urutan tindak lanjut, **bukan severity**.

## Daftar observasi dan rekomendasi

| ID | Prioritas | Observasi sumber | Rekomendasi singkat |
| --- | --- | --- | --- |
| SEC-H01 | P1 | Audit dependency CI mengecualikan semua paket yang dideklarasikan repo | Audit seluruh graph; bedakan dampak build, bundle, dan host |
| SEC-H02 | P2 | Smart link belum memeriksa ulang dokumen dan focused range setelah pembacaan clipboard | Batalkan transaksi bila dokumen atau batas fokus berubah |
| SEC-H03 | P2 | URL clipboard disisipkan mentah ke sintaks Markdown | Gunakan serialisasi destination yang aman untuk Markdown |
| SEC-H04 | P3 | Build release tidak mengikat checkout secara eksplisit ke commit tag release | Catat dan verifikasi identitas commit release sebelum build/publikasi |
| SEC-H05 | P3 | Guard deploy memeriksa nama folder dan keberadaan parent secara leksikal | Definisikan kebijakan canonical path dan junction/symlink |

### SEC-H01 — Cakupan audit dependency CI tidak sesuai graph repo

**Bukti:** `.github/workflows/ci.yml:32` menjalankan
`pnpm audit --prod --audit-level high`. Semua deklarasi paket ada pada
`package.json:14`, yaitu `devDependencies`; repo tidak mendeklarasikan
`dependencies` atau `optionalDependencies`.
Dokumentasi resmi pnpm menjelaskan bahwa `--prod` hanya mengaudit dua kategori
terakhir tersebut: [pnpm audit](https://github.com/pnpm/pnpm/blob/main/pnpm/docs/cli/audit.md).

`scripts/lib/build.ts:68` memakai bundling, sementara `:83` mengecualikan modul
host seperti Obsidian, Electron, CodeMirror dan Lezer. Kategori dependency
package manager saja tidak menjelaskan apakah kode masuk bundle atau hanya
dipakai untuk build. Hasil gate `--prod` tidak cukup untuk menyatakan graph
dependency proyek sudah diperiksa terhadap advisory.

**Dampak yang terbukti:** ketidaksesuaian cakupan pemeriksaan otomatis.
Tidak ada paket rentan tertentu, CVE aktif, atau jalur eksploitasi yang
dibuktikan pada audit ini. Dependabot yang dikonfigurasi mingguan memberi
kontrol tambahan, tetapi keadaan alert dan eksekusinya belum diperiksa.

**Perbaikan minimum:** hilangkan filter `--prod` pada gate yang dimaksudkan
untuk graph proyek, atau tambahkan gate development dependency yang jelas.
Triase hasil berdasarkan paket build, kode yang dibundel, dan modul eksternal
yang disediakan host. Bila perlu pengecualian, catat GHSA, alasan, pemilik,
dan tanggal peninjauan; jangan memindahkan kategori paket hanya untuk
mengubah hasil audit. Rekomendasi ini belum diterapkan.

**Acceptance:** pemeriksaan terkontrol pada fixture advisory development
harus membuktikan bahwa gate baru menyertakannya. Inventaris build harus
menunjukkan paket yang dibundel versus eksternal. Pemindaian advisory baru
harus menyebut tanggal dan graph yang diperiksa.

### SEC-H02 — Validasi ulang smart link belum mencakup perubahan dokumen

**Bukti:** `src/capabilities/features/toolbar/executor.ts:119` mengambil teks
selection sebelum `await` pembacaan clipboard pada `:132`. Pemeriksaan ulang
di `:139` memeriksa policy dan koordinat selection, tetapi tidak membandingkan
identitas dokumen/teks yang diambil sebelumnya, serta tidak menguji ulang
`revalidated.visible` terhadap selection sebelum dispatch pada `:155`.

Guard yang sudah ada tetap berarti: `src/capabilities/features/toolbar/controller.ts:276` mengikat target ke
editor/file dan owner document; policy menolak target yang berubah, tidak
editable, atau bukan source editor. `tests/toolbar-actions.test.ts:160`
mencakup perubahan selection saat clipboard dibaca, tetapi belum skenario
perubahan teks dengan koordinat selection yang sama atau perubahan fokus.

**Risiko:** transaksi tertunda dapat memakai teks lama atau melewati batas
fokus yang baru. Ini risiko integritas editing milik pengguna yang sama;
belum ada aktor dengan wewenang lebih rendah yang terbukti mengambil alih
file lain. Skenario belum dieksekusi dalam audit ini.

**Perbaikan minimum:** simpan identitas dokumen awal, lalu batalkan bila
dokumen berubah selama `await`. Uji ulang selection terhadap focused range
terbaru tepat sebelum dispatch, dengan memakai guard yang sudah ada.
Jangan mengubah command ID, format Markdown, atau kebijakan undo.

**Acceptance:** regression test dengan promise clipboard tertunda untuk
perubahan dokumen pada koordinat sama dan perubahan focused range harus
menghasilkan penolakan tanpa transaksi. Kasus clipboard normal tetap bekerja.

### SEC-H03 — Validasi protokol URL belum menjamin serialisasi Markdown

**Bukti:** `src/capabilities/features/toolbar/actions.ts:97` memakai
`new URL(value)` dan mengizinkan protokol HTTP/HTTPS. Akan tetapi,
`linkWrapEdit` pada `:92` menggabungkan nilai URL asli ke
`[teks](url)` tanpa serialisasi destination atau penolakan karakter kontrol.
Executor memilih string clipboard asli pada `executor.ts:134`.

**Risiko:** string yang dapat diparse sebagai URL bisa memiliki delimiter
yang bermakna pada Markdown. Tujuan validasi protokol dan tujuan serialisasi
Markdown berbeda. Audit belum membuktikan eksekusi script, kebocoran data,
atau request jaringan tidak sah; jangan menamai observasi ini XSS/RCE.

**Perbaikan minimum:** pisahkan parsing URL dari serialisasi destination.
Tolak karakter kontrol dan gunakan bentuk destination yang menjaga tanda
kurung/backslash tidak keluar dari link. Pertahankan pembatasan HTTP/HTTPS,
fallback placeholder, dan smart URL yang opt-in. Hindari blacklist payload.

**Acceptance:** test tanda kurung, backslash, line break dan URL biasa harus
memastikan satu link menuju destination yang dimaksud. Pemeriksaan renderer
Markdown nyata tetap diperlukan untuk membuktikan hasil sintaks akhirnya.

### SEC-H04 — Identitas commit release perlu dibuat eksplisit

**Bukti:** job build di `.github/workflows/release.yml:43` melakukan checkout
tanpa `ref` release yang eksplisit. Pemeriksaan pada `:58` membandingkan nama
tag dengan versi manifest, bukan membuktikan kesamaan commit tag dan sumber
build. Publisher mengunduh artifact dari workflow yang sama, lalu membuat
attestation dan mengunggahnya.

**Risiko:** hubungan tag, sumber, dan artifact bergantung pada konteks event
dan perilaku release-please/checkout. Tidak ada substitusi artifact atau
publikasi tanpa izin yang dibuktikan. Tidak adanya `ref` eksplisit juga
**bukan bukti** checkout selalu memakai main terbaru; SHA event tidak
diverifikasi secara live pada audit ini.

**Perbaikan minimum:** resolusikan commit release yang dimaksud, checkout
commit tersebut, dan verifikasi hubungannya dengan tag sebelum build.
Simpan identitas commit pada bukti build/provenance. Pertahankan pemisahan
job build dengan publication dan human release gate yang sudah berlaku.

**Acceptance:** fixture workflow tanpa publikasi harus menunjukkan bahwa
tag dan sumber build merujuk commit yang sama, serta menolak mismatch
walaupun teks versi sama. Jangan membuat tag atau release untuk menguji ini.

### SEC-H05 — Guard tujuan deploy belum mendefinisikan canonical path

**Bukti:** `scripts/lib/deploy-plugin.ts:59` membandingkan basename tujuan
dengan `manifest.id`; `:69` memeriksa keberadaan parent, lalu `:83` menyalin
tiga file tetap. Source tidak memeriksa canonical hierarchy
`.obsidian/plugins`, symlink/junction, atau ownership tujuan.
`tests/deploy-plugin.test.ts:31` dan `:57` sudah mencakup ID lama dan parent
yang tidak ada, tetapi belum tujuan bernama benar pada hierarchy yang salah.

**Risiko:** salah konfigurasi atau link filesystem dapat mengarahkan deploy
ke lokasi yang tidak dimaksud. Kendali atas konfigurasi/tooling oleh akun
yang sama tidak otomatis merupakan privilege escalation. Tidak ada bukti
aktor lain dapat mengganti path sambil belum memiliki wewenang menulis plugin.
Nilai `.env`, ACL, dan tujuan vault aktual sengaja tidak dibaca.

**Perbaikan minimum:** sepakati apakah linked vault/junction didukung.
Jika guard ditujukan untuk menolak salah lokasi, validasi canonical path
dan hierarchy sebelum copy, sesuai kebijakan tersebut. Jangan melarang
linked vault yang sah secara diam-diam atau mengganti pemeriksaan ACL dengan
sekadar validasi string.

**Acceptance:** fixture direktori sementara mencakup tujuan normal, ID benar
di hierarchy salah, parent hilang, dan symlink/junction sesuai kebijakan.
Penolakan harus terjadi sebelum file tujuan berubah. Jangan memakai vault
operasional sebagai fixture.

## Kontrol positif yang ditemukan

- CSS callout memvalidasi ulang ID, warna hex dan ikon Lucide di output
  boundary; stylesheet memakai `textContent`, bukan HTML mentah
  (`src/capabilities/features/callouts/styles.ts:40`, `:63`, `:122`).
- Navigasi GFM mensyaratkan TFile dan heading yang ditemukan melalui
  metadata cache. Tidak ditemukan sink filesystem mentah atau subprocess
  pada jalur anchor yang diperiksa (`src/gfm-anchor/resolver.ts:63`,
  `src/gfm-anchor/navigation.ts:164`).
- Fold auto-ID memiliki opt-in, read-only/Hemingway dan focused-range guard.
  Coordinator mengikat save tertunda ke owner/revisi dan menangani pembatalan.
  `SettingsWriter` menyalin snapshot dan menyerialisasi penulisan.
- CI memakai read permissions, action yang dipin SHA, frozen lockfile, dan
  quoted environment variables untuk metadata PR. Write permissions release
  dipisah menurut job; tidak ada jalur `pull_request_target`/`workflow_run`
  dalam workflow yang diperiksa.
- Fullscreen Electron adalah operasi tetap dari command/settings dan
  memiliki guard mobile. Temuan compatibility pada audit lama tidak
  diteruskan sebagai kerentanan versi sekarang.

## Cakupan, bukti, dan batas klaim

Lihat [arsitektur audit](architecture.md),
[ledger cakupan](coverage-ledger.json), dan
[rekaman kerentanan terstruktur](findings.json).
Nilai kosong `findings.json` sesuai dengan nol kandidat yang lolos pemeriksaan
batas wewenang; lima observasi penguatan di atas bukan rekaman kerentanan.

Empat agen memetakan produk, wewenang, input/sink, dan batas eksekusi.
Tiga agen menelaah runtime content, settings/editor, dan tooling; satu agen
tambahan menelaah CSSOM discovery setelah kritik cakupan.
Hasil source-only dibukukan per invariant dan path, bukan klaim membaca
setiap baris dari seluruh dependency. Tiga agen pada percobaan awal terputus
karena restart daemon dan tidak menyumbangkan bukti yang dipakai laporan.
Tidak ada batas jumlah agen yang ditetapkan pengguna.

Tidak ada ledger JSON audit terdahulu yang kompatibel. Checklist readiness
Mei 2026 di `docs/archive/` berkaitan dengan identitas/versi lama dan tidak
dipakai sebagai bukti keamanan commit ini. Catatan dependency historis juga
tidak dipakai untuk menyatakan kondisi advisory sekarang.

Tidak dilakukan pembacaan `.env`/credentials, penulisan vault operasional,
instalasi paket, pemindaian registry/advisory database, probe layanan,
pengujian Obsidian, build, maupun test repo. Satu penelusuran dokumentasi
publik pnpm dipakai untuk memeriksa arti filter audit; itu bukan pemindaian
dependency. Git history penuh dan source internal dependency tidak diaudit.

Skill `security-audit` mensyaratkan: “If every control cannot be enforced,
do not execute target code”. Isolasi environment kosong, target/toolchain
read-only, scratch-only writes dan limit sumber daya OS belum tersedia.
Karena itu `pnpm run check` dan `pnpm run verify` tidak dijalankan dan tidak
dilaporkan lulus. Lihat [validasi yang tersisa](NEEDS-VALIDATION.md).

CLI validator audit menolak input dengan pesan
`OS no-follow and nonblocking input protection is unavailable`.
API struktural validator yang sama dapat memeriksa objek yang disusun parent
di memori, tetapi hasil itu tidak menggantikan gate pembacaan file aman.
Status metadata tetap `incomplete` karena batas platform ini.

Ledger final: **9 unit source-covered, 1 host-rendering blocked, 0 kandidat,
0 deferred**. Critic setelah wave kedua dan final-clean critic tidak menemukan
gap sumber atau reassignment tambahan. Ini bukan klaim keamanan runtime.
Detail pemeriksaan ada di [catatan verifikasi](verification.md).
