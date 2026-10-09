# Security Policy

## Supported versions

Only the latest release receives security fixes.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability.
Report it privately through GitHub: <https://github.com/parkisutama/obsidian-unisastra/security/advisories/new>.

Include the affected version, the conditions that reproduce the problem, its impact, and any mitigation you know of.
This is a personal project maintained in spare time; reports are read and answered on a best-effort basis, with no guaranteed response time.

## Scope

The plugin runs inside Obsidian and reads and writes notes in your vault.
Reports are in scope when note content, file names, or settings data can make the plugin write outside the vault, run code, corrupt notes, or send data anywhere.
Problems in Obsidian itself or in another plugin belong to their own projects.
