# Agent handoff protocol

`current.md` is the handoff record of the branch in progress. Read it together with
`AGENTS.md`, the linked plan and the real Git state. This document grants no extra
authority and does not override maintainer instructions.

Ubuntu owns implementation and automated validation, run inside bubblewrap. Windows owns
native acceptance in a running Obsidian, driven through the Obsidian CLI. Both work on the
same feature branch; there is no Windows integration branch. GitHub Flow and release-please
are unchanged.

1. The current writer records completed work, pending work, blockers, the exact code SHA
   under test, commands and results, and the next owner.
2. Commit and push the branch when authorized. Keep session history and credentials out of Git.
3. The receiving agent fetches, checks for local changes or divergence, fast-forwards, and
   compares the branch and the code SHA with `current.md` before acting.
4. During native testing, Ubuntu implementation pauses. Windows records results against the
   tested code SHA in a separate documentation commit, then returns the turn.
5. Ubuntu pulls the results before changing code. If code changed, decide which earlier
   results still apply; never mark them current silently.

Required fields in `current.md`: date, branch, state, owner and next owner, code SHA,
environment, changes made, checks and evidence, blockers, next actions, authorization
boundaries. Record a full SHA before any native run.

Only one writer acts at a time. Native acceptance and automated checks are distinct records.
A handoff never merges a pull request, merges a Release PR, creates a tag or publishes a release.

## Rules for native testing with the Obsidian CLI

`obsidian eval` runs code inside the live app with the permissions of the open vault.
Treat every call as code execution.

- Use a dedicated test vault only, never a working vault. Check the vault name and path
  before the first call.
- Do not read or print `.env` or any credentials. Set `OBSIDIAN_VAULT_PLUGIN_PATH` to
  `<test-vault>/<config>/plugins/unisastra` as described in `.env.example`.
- Keep `OBSIDIAN_DEPLOY_VERIFICATION=runtime`. Use `structural` only when the maintainer asks
  for an offline check, and say so in the record. Never fall back to it after a runtime failure.
- Windows uses `Obsidian.com`; Linux uses `obsidian`. The CLI must be enabled in Obsidian
  settings and the target vault must be open, or `pnpm run deploy` stops.
- Send only fixed, reviewed snippets. Never interpolate note content, file names or settings
  values into an `eval` string.
- Read results from the DOM, the editor state and the settings file. Do not take screenshots
  that contain private notes.
- Restore the test vault and the plugin folder afterwards: reload the plugin, close files
  opened for the test, and record any leftover state.
- Do not install dependencies for the test. If Windows `node_modules` is missing, report it
  to the maintainer. Do not copy Linux `node_modules`.
- Record the Obsidian version, the operating system, the full code SHA and the result of every
  step. A step that was not run is written as not run.
