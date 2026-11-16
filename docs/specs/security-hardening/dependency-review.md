# Dependency advisory checkpoint - 2026-11-16

Toolchain: Node 24.21.0, pnpm 12.10.1. Full graph; registry audit at
implementation time, not evidence that every advisory is reachable in runtime.

## Results

- Before: {"info":0,"low":3,"moderate":6,"high":1,"critical":0}.
- After Vite 6.4.3 to 6.4.4: {"info":0,"low":2,"moderate":4,"high":0,"critical":0}.
- Both full `pnpm audit --json` commands exit 1 because the default floor
  includes lower severities. The exact CI command pnpm audit --audit-level high exited 0; no ignore was added.
- [Baseline JSON](dependency-audit.json) and [post-patch JSON](dependency-audit-after.json).

The narrow override and lockfile change patch the Vitest/Vite development
toolchain. Host CM6 pins, runtime imports and plugin versions remain unchanged.
[GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm)
identifies 6.4.4 as the fixed Vite 6 patch. No dev server exploit was attempted.

## Remaining advisories (open, not ignored or declared harmless)

| Package | Severity | Advisory | Registry patched range |
| --- | --- | --- | --- |
| fast-uri | moderate | GHSA-w74x-v6f9-j3xg | >=3.1.9 |
| fast-uri | low | GHSA-xhq7-xmqj-769h | >=3.1.9 |
| fast-uri | moderate | GHSA-wjr9-j795-jxcr | >=3.1.9 |
| fast-uri | low | GHSA-333x-w4r6-6crp | >=3.1.9 |
| vite | moderate | GHSA-8g5g-mxqh-grgj |  |
| minimatch | moderate | GHSA-g3hv-75wg-m249 | >=11.0.1 |

- fast-uri is reached through AJV in lint/commitlint tooling.
- minimatch is reached through tooling glob matching.
- The remaining Vite advisory concerns development server filesystem denial
  rules. Vite remains in the test toolchain; no plugin runtime bundling is
  established by this classification alone.

These require follow-up reachability/compatibility triage; this slice does not
upgrade unrelated tooling, lower the threshold, or create advisory exceptions.
Actual CI execution and hosted alert closure remain unverified.

Update 2026-11-16: the Vite override was superseded by the Vite 8.3.8 update (#34);
the high-severity Vite advisory no longer appears and `pnpm audit --audit-level high` exits 0.
