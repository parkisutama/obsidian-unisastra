# Deploy target verification

Status: Accepted for local planning and implementation on 2026-11-16.
Requirement: SEC-H05 follow-up to the [audit](../../audit/2026-11-16/REPORT.md).

The maintainer approved runtime metadata as the strongest check of the active
Obsidian config folder, with explicit structural-only verification for offline
use. Preserve OBSIDIAN_VAULT_PLUGIN_PATH and the synchronous deploy API.

- Default runtime verification reads vault root and configDir together through
  a fixed, read-only Obsidian CLI eval. CWD selects the intended vault; returned
  canonical root must match, even if the CLI falls back to a different vault.
- Compare the destination with the active configDir/plugins/plugin-id. Support
  custom config names and root/config aliases that resolve to that same location.
- Never silently downgrade failed runtime verification. Offline use requires
  OBSIDIAN_DEPLOY_VERIFICATION=structural and an explicit warning that active
  config identity is unverified. No app.json/appearance.json authenticity claims.
- Validate all source/destination file types before the first target write.
  Reject redirected plugins/plugin folders and symlink/hardlink destination files.
- Unconfigured optional dev deployment still skips without invoking the CLI.
  Build stays independent of Obsidian; deploy/dev remain vault-writing commands.

No runtime plugin changes, registry/database inspection, dependency additions,
operational vault deploy, commit, push, tag or release. Preflight is not atomic
replacement or protection against a hostile concurrent filesystem writer.
