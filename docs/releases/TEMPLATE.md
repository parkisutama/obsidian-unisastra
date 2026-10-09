---
title: "Release X.Y.Z"
created: "YYYY-MM-DDTHH:mm:ss+07:00"
tags:
  - release
status: draft
authority: record
owner: "Parkis Utama"
---

# Release X.Y.Z

Copy this file to `docs/releases/X.Y.Z.md` in the Release PR of a minor or major release.
A patch release uses the Release PR description instead.
The name has no `v` prefix, the same as the tag.

## Release Gate

Keep the latest decision here; move earlier decisions to the change history.

- **Gate:** G3
- **Decision:** pending
- **Decision owner:** Parkis Utama
- **Date:** YYYY-MM-DD
- **Subject:** X.Y.Z at _commit_
- **Rationale:** _complete at decision_
- **Conditions:** none
- **Evidence gaps accepted:** none
- **Next review trigger:** none

Allowed decisions: `pending`, `approved`, `revise`, `postpone`, `withdrawn`.
Only the decision owner sets a decision other than `pending`.

## Release

- **Version and tag:** X.Y.Z
- **Changelog:** _link to the section in CHANGELOG.md_
- **Scope:** _features, fixes, or specifications included_

## Evidence summary

| Evidence | Result | Where |
| --- | --- | --- |
| `pnpm run verify` in CI | _pass or fail_ | _link to the workflow run_ |
| Runtime dependency audit | _result_ | _link_ |
| Native acceptance | _what was checked_ | _notes below_ |

## Native acceptance

State what was checked inside Obsidian, and what was not.

- **Obsidian version and platform:** _for example 1.14.4, Windows desktop_
- **Checked:** _scenarios_
- **Not checked:** _scenarios, including mobile and popout windows when they apply_

## Known limitations

none

## Migration and rollback

none

## Artifacts and provenance

- `main.js`, `manifest.json`, `styles.css`, and the plugin zip attached to the GitHub release.
- Build provenance attestation: _link_

## Change history

| Date | Change | Decision |
| --- | --- | --- |
| YYYY-MM-DD | Release candidate prepared | pending |
