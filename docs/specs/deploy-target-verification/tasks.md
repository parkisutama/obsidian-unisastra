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

## Live acceptance (maintainer, disposable vaults)

2026-11-16, Windows, Obsidian CLI, disposable vaults `unisastra-testvault` and
`unisastra-othervault` (no working vault touched):

| Case | Result |
| --- | --- |
| Deploy with the target vault open | Passed; canonical path printed, files copied |
| Obsidian closed | Passed; `Cannot query Obsidian CLI`, nothing written |
| Target is another vault than the running one | Maintainer reported passed |
| Active vault is the target | Passed; verified root/config matched, files copied |
| `OBSIDIAN_DEPLOY_VERIFICATION=structural` | Not exercised |

The maintainer closed live acceptance on this basis. The structural-mode run was
not performed; fixtures cover it. Independent source review of D2 is not recorded.
