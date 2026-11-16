# Deploy target implementation plan

Approved scope: [spec](spec.md). One writer on the existing security audit branch;
preserve the uncommitted SEC-H01 through SEC-H04 work.

1. Record the additive verification mode and CLI requirement in ADR-007.
2. Add failing deployment regressions for runtime root/config matching, malformed
   or failed CLI output, offline opt-in, and filesystem aliases/file types.
3. Add a Node-only CLI reader in scripts/lib; integrate canonical preflight into
   the existing deploy helper before mkdir/copy. Keep both callers synchronous.
4. Test real filesystem writes only in disposable fixtures, with mocked CLI
   metadata. Probe live CLI output using dummy data only; no production deploy.
5. Run targeted tests, check/verify and independent source review; update active
   contracts, .env.example and evidence. No user credential/config file changes.

Use shell-free execFileSync, Windows Obsidian.com, a bounded timeout/output,
strict metadata parsing and a single eval snapshot. No custom command option or
arbitrary eval input. Default runtime failure stops deployment. Structural mode
is an explicit limited assurance choice, not evidence of an active Obsidian vault.

Risks: CLI unavailable/disabled, wrong-vault fallback, custom config selection,
Windows junctions and output framing. All must fail before target writes except
the explicitly selected structural mode. Root/config aliases may be supported;
redirecting the plugins root or per-plugin directory is rejected. Low-level
copy failures and adversarial TOCTOU are outside preflight guarantees.

Acceptance: successful default/custom config and root alias fixtures; wrong
root/inactive config/CLI errors/malformed data/unsafe links and file types leave
target and external fixture files unchanged. Real CLI-to-deploy acceptance
remains separate from fixture results. See [tasks](tasks.md).

References: [official CLI](https://obsidian.md/help/cli),
[config folder](https://obsidian.md/help/configuration-folder),
[Obsidian API](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts).
