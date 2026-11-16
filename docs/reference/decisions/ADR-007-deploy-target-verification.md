# ADR-007: Verify active deployment targets

- Date: 2026-11-16.
- Status: Accepted and implemented (#37). Live acceptance on disposable vaults
  passed on 2026-11-16; structural mode was not run live. See the
  [deploy ledger](../../specs/deploy-target-verification/tasks.md).
- Contract: [deploy verification spec](../../specs/deploy-target-verification/spec.md).

## Context

A folder named unisastra under an existing parent does not prove that the path
is the active Obsidian config. Old config folders can remain after an override;
app.json/appearance.json are not an authentication marker. The desktop CLI can
return vault root/configDir, but it may fail or select an unintended vault.

## Decision

Keep OBSIDIAN_VAULT_PLUGIN_PATH. Default to runtime verification using one
fixed read-only eval from the inferred vault root. Canonical runtime root and
active config/plugins path must match the configured destination. Reject a
redirected plugins root, plugin folder or non-regular/linked destination files
before any target mkdir/copy. Allow root/config aliases resolving consistently.

An additive OBSIDIAN_DEPLOY_VERIFICATION=structural mode explicitly permits
offline structural-only preflight, with a warning and no active-config claim.
There is no automatic fallback or force flag after runtime mismatch. Unconfigured
dev still skips deployment. Both deploy callers keep their synchronous contract.

## Alternatives considered

- Trust JSON filenames: cannot distinguish active config from stale copies.
- Read Obsidian internal registry/Local Storage: undocumented and insufficient
  by itself to establish the active runtime folder.
- Silent fallback on CLI failure: hides the absence of runtime proof.
- Reject every junction: breaks legitimate root aliases without improving
  identity checks when runtime and canonical locations agree.

## Consequences

Configured deploy/dev now needs a reachable running Obsidian CLI unless the
operator explicitly selects structural verification. This is a fail-closed
tooling compatibility change, not a runtime plugin or vault format migration.
Preflight does not guarantee atomic replacement or eliminate hostile TOCTOU.
