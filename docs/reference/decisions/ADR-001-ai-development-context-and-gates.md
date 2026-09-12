# ADR-001: AI development context and Git gates

- Date: 2026-09-12
- Status: Accepted

## Context

The maintainer requested standardization with
[Focus Notes](https://github.com/parkisutama/obsidian-focus-notes): Husky,
instructions for Claude and other agents, and documentation as development context.
MD Writer already has VitePress docs and its own QA/release tooling, but uses
Lefthook and ignores AGENTS.md in Git.

## Decision

- Track `AGENTS.md` as canonical instructions; `CLAUDE.md` refers to it.
- Read development status, current state, architecture, relevant ADRs, and task docs
  before implementation. Archives retain history and do not define current behavior.
- Replace Lefthook with Husky 9. Pre-commit runs read-only `check`; commit-msg
  validates Conventional Commits using commitlint's conventional configuration.
- Require docs build in `check:ci` and check every PR commit message in CI.
- Keep MD Writer's source layout, Vitest runner, and release metadata workflow.
  Release commits use `chore(release): <version>` and no longer bypass local hooks.
- Invoke Vitest through Node directly so the QA runner works on Windows as well
  as Linux. Test/build wrappers use the native temporary directory on Windows.

## Consequences

Local hooks do not autofix or stage unrelated changes. Developers explicitly run
fix commands and review the result. Commit message syntax is automated; atomicity,
documentation accuracy, architecture, and Obsidian acceptance remain review duties.
Branch protection must be configured separately on GitHub; no setting is implied
by adding a workflow. Existing historical commit messages are not rewritten.
