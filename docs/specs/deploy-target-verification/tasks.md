# Deploy target verification ledger

| Task | Area | Acceptance | State |
| --- | --- | --- | --- |
| D1 | Contract and ADR | Preserve path key; explicit offline mode; no implicit downgrade | Recorded |
| D2 | CLI reader and deploy helper/tests | Runtime metadata gates all target writes; unsafe paths rejected | Implemented; 19 deploy tests pass |
| D3 | Docs and final gates | check/verify, review and native limitations recorded | Automated gate passed; independent review and live CLI acceptance pending |

## Observed CLI boundary

Read-only help probe: CLI eval is available through Obsidian.com. The sandbox
could not reach its socket; the approved unsandboxed probe succeeded. A fixed
dummy eval JSON.stringify({probe:123}) returned `=> {"probe":123}`. No private
notes/config contents were read, and no operational target was deployed.

Fixture tests will mock metadata while exercising real filesystem preflight.
Live target metadata/deploy acceptance is not established by the dummy probe.

## Final automated gate

2026-11-16: `pnpm run verify` exited 0 on the working tree: 36 Vitest files,
305 tests (19 in `tests/deploy-plugin.test.ts`), TypeScript, Biome, Obsidian
ESLint, Stylelint and Markdown lint, build and artifact verification for 0.0.1,
and all 20 conformance tests. No operational vault was deployed.

Still open: independent source review of D2, and a live Obsidian CLI to deploy
run against a disposable vault. Fixture results do not establish either.
