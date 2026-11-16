# Security hardening requirements

Status: Accepted 2026-11-16; implemented in #35, #36 and #39. See the [ledger](tasks.md).

Follow-up: SEC-H05 is now authorized separately in the
[deploy verification contract](../deploy-target-verification/spec.md).
The exclusions below preserve the original SEC-H01 through SEC-H04 slice.
Source: [approved plan](plan.md), [audit](../../audit/2026-11-16/REPORT.md).

- SEC-H01: audit the full dependency graph at the existing high severity floor;
  record actual advisories without suppression, recategorization or broad upgrades.
- SEC-H02: cancel pending Link edits if document identity, target policy, selection
  or current focused range no longer permits the original action.
- SEC-H03: reject raw clipboard control characters before trimming; serialize
  Markdown destination delimiters and whitespace without changing URL meaning.
  Preserve HTTP(S), placeholder fallback, ordinary links, unwrap and undo.
- SEC-H04: bind checkout to release-please SHA; verify HEAD, peeled tag and
  workflow event SHA agree before install/build and publication provenance.
- SEC-H05 is deferred. No deploy-path changes, new runtime dependencies,
  identifiers/settings migration, push, tag, release or operational vault writes.

Tests use Vitest and dummy local repositories. Commands: `pnpm run test`,
`pnpm run check`, `pnpm run verify`. Native/hosted acceptance is separate evidence.
Existing src/capabilities, src/cm6 and scripts responsibilities remain unchanged.
Style follows the surrounding tab-indented TypeScript and existing error handling.
