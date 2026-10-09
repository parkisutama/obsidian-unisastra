# AGENTS.md

## Read first

1. `docs/development-status.md`: engineering status and validation limits.
2. `docs/current-state.md`: implemented capabilities and compatibility contracts.
3. `docs/reference/code-architecture-baseline.md`: module responsibilities.
4. `docs/reference/decisions/`: accepted architectural decisions.
5. `docs/for-developers/ai-assisted-development.md`: workflow and context selection.

Read the relevant source and tests before changing behavior. Active documents
describe the contract; verify implementation rather than assuming a plan is shipped.
`docs/archive/` is historical context, not current requirements.

## Strategi pengembangan

- Mulai dari positioning di `README.md` dan workflow pengguna di `docs/for-users/`:
  drafting presisi, whitespace-aware editing, dan navigasi outliner di Obsidian.
  Kaitkan usulan fitur dengan masalah pengguna dan hasil yang dapat diuji.
- Bandingkan kebutuhan dengan `docs/current-state.md`, source, tests, dan status.
  Pisahkan yang sudah ada, parsial, belum ada, serta benar-benar ditegakkan otomatis.
  Rencana di spesifikasi outliner bukan bukti bahwa semua kebutuhan sudah shipped.
- Untuk menentukan prioritas, paparkan manfaat pengguna, risiko regresi editor/data,
  compatibility, effort, dependency, dan bukti yang masih kurang. Gunakan
  `prioritization-advisor` atau `feature-investment-advisor` bila ada beberapa opsi.
  Jangan memilih roadmap atau perluasan scope tanpa keputusan maintainer.
- Utamakan perbaikan yang menjaga workflow menulis, selection, folding, dan Markdown
  vault. Hindari migrasi besar hanya untuk menyamakan struktur dengan repo referensi.
- Kerjakan satu tema dalam vertical slice: perilaku pengguna, implementasi, test,
  dokumentasi, dan acceptance. Pisahkan pekerjaan produk dari tooling dan release.

## Pemilihan skill AI

Gunakan skill yang tersedia dan relevan di lingkungan AI saat ini. Baca SKILL.md
sebelum menerapkannya dan beri tahu pengguna skill yang dipakai. Nama pendek di
bawah merujuk skill dengan nama tersebut, termasuk prefix plugin bila ada.
Jangan menganggap daftar ini membuat skill otomatis terpasang atau terpanggil.

| Kondisi atau fase | Skill | Hasil yang diharapkan |
| --- | --- | --- |
| Kebutuhan pengguna atau produk baru | `problem-statement`, `jobs-to-be-done`, lalu `prd-development` sesuai kebutuhan | Masalah, pengguna, outcome, scope, dan acceptance criteria |
| Requirement teknis belum jelas | `interview-me` | Intent, constraint, dan definisi sukses yang dikonfirmasi manusia |
| Beberapa kandidat prioritas | `prioritization-advisor`, `feature-investment-advisor` | Trade-off dan rekomendasi untuk keputusan maintainer |
| Fitur atau perubahan behavior yang memerlukan perencanaan | `spec-driven-development` | SPECIFY, PLAN, TASKS sebelum IMPLEMENT |
| Memecah pekerjaan | `planning-and-task-breakdown` | Vertical slices, dependencies, acceptance, dan checkpoint QA |
| Implementasi bertahap | `incremental-implementation` | Satu slice selesai dan diverifikasi sebelum slice berikutnya |
| Perubahan behavior yang memerlukan regression test | `test-driven-development` | Test gagal yang mereproduksi kebutuhan, lalu implementasi minimal |
| Bug atau gate gagal | `debugging-and-error-recovery` | Reproduksi, akar masalah, perbaikan, dan verifikasi |
| Arsitektur, API publik, atau format Markdown berubah | `documentation-and-adrs` | ADR sebelum implementasi serta update baseline |
| UI editor atau settings | `frontend-ui-engineering` | UI sesuai Obsidian, aksesibilitas, lifecycle, dan acceptance runtime |
| Review sebelum integrasi | `code-review-and-quality`, `code-simplification` bila diperlukan | Review correctness, compatibility, risiko, dan kompleksitas |
| CI, hooks, build, atau release | `ci-cd-and-automation`, `git-workflow-and-versioning`, `shipping-and-launch` sesuai task | Gate reproducible dan prosedur integrasi/release yang dapat direview |

Pilih skill minimum yang membantu fase saat ini, bukan seluruh daftar untuk setiap
task. Jika skill penting tidak tersedia, jelaskan keterbatasannya; gunakan workflow
manual yang setara bila memungkinkan tanpa mengklaim sudah memakai skill tersebut.

## Project conventions

- Node.js 24, pnpm as pinned in `package.json`, TypeScript, CodeMirror 6,
  Obsidian API, Biome, ESLint Obsidian rules, Stylelint, rumdl, Vitest, VitePress.
- Keep the current `src/capabilities`, `src/cm6`, and composition structure.
  Do not transplant Focus Notes feature layers or its test runner into this repo.
- Preserve plugin ID `unisastra`, existing command IDs, settings keys,
  frontmatter keys, Markdown block IDs, and CSS compatibility classes.
- Use explicit Obsidian App instances and lifecycle cleanup. Preserve mobile and
  popout behavior; use the editor's document/window for DOM operations.
- Keep filesystem and deployment tooling in `scripts/`; do not add Node-only
  dependencies to browser/mobile runtime code. Follow `lint:obsidian` constraints.

## Workflow order — jangan lompat fase

1. **Inspect context.** Periksa Git status dan pertahankan perubahan lokal. Baca
   konteks aktif, source, dan tests yang relevan. Jangan membaca isi `.env` atau
   credentials dan jangan deploy ke vault operasional secara implisit.
2. **Clarify intent.** Kebutuhan produk baru dimulai dengan skill PM. Bila pengguna,
   masalah, constraint, atau definisi sukses belum jelas, gunakan `interview-me`
   sebelum menulis spec. Jangan mengisi gap requirement dengan keputusan produk sendiri.
3. **Branch before artifacts.** Setelah intent dikonfirmasi, buat branch kerja
   sebelum ADR/spec/plan/task pertama. Ikuti branching conventions; agen Codex
   menggunakan prefix `codex/` sesuai lingkungan. Jika branch task sudah ada,
   lanjutkan di sana. Jika artefak terlanjur dibuat di main, pindahkan ke branch
   dengan mempertahankan pekerjaan lokal sebelum commit.
4. **SPECIFY.** Gunakan `spec-driven-development`: masalah, scope/non-goals,
   behavior, acceptance criteria, dan kontrak kompatibilitas. Validasi spec dengan
   manusia sebelum PLAN. Bug kecil dengan requirement dan acceptance yang sudah
   eksplisit dapat memakai catatan singkat; fase tetap harus jelas.
5. **PLAN.** Identifikasi modul, pendekatan, alternatif, dependency, risiko regresi,
   dan QA desktop/mobile/popout. Untuk perubahan dependency direction, command ID,
   view type, settings contract, compatibility identifier, atau format Markdown vault,
   gunakan `documentation-and-adrs` dan tulis ADR sebelum implementasi.
   Validasi plan dengan manusia sebelum TASKS.
6. **TASKS.** Gunakan `planning-and-task-breakdown` untuk vertical slices.
   Tiap task menyebut acceptance, file/area, dependency, test, dan update docs.
   Validasi task breakdown dengan manusia sebelum IMPLEMENT.
7. **IMPLEMENT.** Gunakan `incremental-implementation`: implementasi satu slice,
   test relevan, `pnpm run check`, review, lalu atomic commit bila diotorisasi.
   Gunakan TDD untuk behavior/regression yang membutuhkannya. Checkpoint setiap
   2–3 task; gate gagal ditangani dengan debugging sebelum melanjutkan.
8. **VERIFY AND REVIEW.** Jalankan `pnpm run verify`, lalu review kualitas dan
   compatibility. QA otomatis tidak menggantikan acceptance Obsidian. Bila runtime
   belum diuji, catat sebagai belum diuji, jangan nyatakan fitur siap shipped.
9. **UPDATE AND HANDOVER.** Perbarui current state, architecture baseline, status,
   ADR dan user docs yang relevan. Laporkan hasil, blocker, acceptance yang tersisa,
   serta tahap selanjutnya. Review setiap file terhadap requirement sebelum staging.

Validasi manusia antar fase berlaku untuk perencanaan fitur/perubahan baru.
Gunakan keputusan dan otorisasi eksplisit yang sudah diberikan dalam sesi; jangan
meminta persetujuan yang sama lagi. Jangan menganggap diam atau waktu berlalu
sebagai validasi, dan jangan berhenti untuk meminta persetujuan rutin di dalam
slice implementasi yang sudah disetujui. Revisi panduan yang diminta langsung
dan scope-nya jelas dapat dikerjakan dalam otorisasi tersebut.

## Artefak dan konteks yang durable

- Untuk task terencana baru, buat `docs/specs/<slug>/spec.md`, `plan.md`, dan
  `tasks.md` ketika diperlukan. Folder ini konvensi untuk pekerjaan baru;
  jangan mengklaim sudah ada atau membuat seluruh scaffold tanpa task nyata.
- Task yang sudah mempunyai dokumen aktif tetap memakai dokumen itu. Tautkan
  requirement → task → test/QA → keputusan; hindari dua sumber kebenaran.
- Spec menyimpan kebutuhan; plan menyimpan pendekatan; tasks menyimpan progres.
  `docs/current-state.md` hanya mencatat implementasi yang diverifikasi;
  `docs/development-status.md` mencatat readiness dan gate yang belum selesai.
- ADR memakai status Proposed/Accepted/Superseded. Jangan menghapus keputusan lama;
  tandai superseded dan tautkan penggantinya.
- Setelah fitur shipped, pindahkan artefak selesai ke `docs/archive/` dengan
  memperbarui link. Jangan mengarsipkan pekerjaan yang masih memiliki blocker.
- Catat perubahan user-facing di CHANGELOG mengikuti format release Unisastra
  yang sudah ada (`## x.y.z`). Jangan mengadopsi format atau script versi Focus
  Notes secara diam-diam. Perubahan tooling internal tidak memerlukan entri fitur.
- Update index/sidebar mengikuti `docs/for-developers/documentation-guidelines.md`.

## Before changing or refactoring behavior

1. Pahami alasan implementasi melalui baseline, ADR, spec terkait, dan tests.
2. Identifikasi identifier dan data lama yang harus tetap kompatibel; dokumentasikan
   migrasi additive bila dibutuhkan, jangan menghapus legacy tanpa analisis consumer.
3. Pastikan test mereproduksi behavior penting sebelum mengubah editor/state.
4. Review dependency direction secara manual: belum ada architecture test di repo ini.
5. Update kontrak dan current state setelah implementasi diverifikasi.

## Commands

```bash
pnpm run check             # typecheck + Biome + Obsidian ESLint + SCSS + Markdown + tests
pnpm run test              # Vitest behavior tests
pnpm run verify            # check with coverage + build + artifacts + docs build
pnpm run fix               # explicit autofix; inspect diff afterward
pnpm run build             # dist output, without vault deploy
pnpm run deploy            # build, then copy dist/ to the vault folder from .env
pnpm run verify:artifacts
pnpm run docs:dev
pnpm run docs:build
```

`pnpm run dev` menyiapkan test-vault dan dapat deploy ke vault yang dikonfigurasi.
`deploy` punya efek write ke vault; gunakan hanya dalam scope yang diotorisasi.

## Gates and release

- Husky installs through `pnpm install` / `pnpm run prepare`.
  `pre-commit` runs read-only `check`; `commit-msg` runs commitlint.
- `verify` includes QA, tests, build, artifact verification, and docs build.
  PR commit messages are checked separately in CI. Local hooks can be bypassed;
  they do not prove CI success or enforce atomic commit size.
- Test relevant desktop, mobile, and popout scenarios in Obsidian separately.
  Report automated results and untested runtime scenarios explicitly.
- Releases come from the Release PR flow described in the Release section below and in
  `CONTRIBUTING.md`. Tags match the plugin version without `v`. Do not copy Focus Notes
  version scripts.
- Commit, push, release, and deployment actions must remain within user scope.
  Do not bypass checks to hide failures or claim branch protection is configured.

## Release

Releases follow the workspace engineering standard. The human release gate is merging the Release PR.

- Never merge a Release PR, create a tag, or publish a release. Never edit `version` in `package.json` or `manifest.json` by hand; the Release PR does it.
- Write pull request titles as Conventional Commits: the title becomes the commit on `main` and decides the next version and the changelog entry.
- When a Release PR for a **minor or major** version is open and the maintainer asks for the release record:
    1. Copy `docs/releases/TEMPLATE.md` to `docs/releases/X.Y.Z.md` on the Release PR branch.
    2. Fill the evidence summary from the CI run of that pull request and link the changelog section.
    3. Under native acceptance, list only what the maintainer reports having checked in Obsidian; list everything else under "Not checked". Automated checks are not native acceptance.
    4. Leave `Decision: pending`. Only the maintainer sets `approved`.
- When `minAppVersion` changes, add `"<next version>": "<new minAppVersion>"` to `versions.json` in the Release PR. `pnpm run verify` fails until it is there.
- A patch release needs no release record; the Release PR description is enough.
