# ADR-006: Safe Markdown link destinations

- Date: 2026-11-16.
- Status: Accepted for local implementation under the maintainer's instruction
  to implement SEC-H01–SEC-H04; native acceptance remains pending.
- Contract: [security hardening spec](../../specs/security-hardening/spec.md).

## Context

Smart Link validates HTTP/HTTPS but inserts the original clipboard string into
Markdown. URL parsing does not guarantee destination delimiter safety. Encoding
reserved URL characters can change their meaning, and normalizing every URL
would change ordinary spelling unnecessarily.

## Decision

Reject raw clipboard Unicode control characters before trim. Preserve ordinary
HTTP(S) spelling and placeholder fallback. At the shared destination serializer,
percent-encode whitespace/control characters, and backslash-escape Markdown
backslash, parentheses, angle brackets and ampersands. Escaping ampersands
prevents Markdown entity interpretation from changing the URL. Update unwrap to
accept escaped destination characters and keep selection offsets over the full
serialized destination. No old vault text is rewritten; legacy simple links
remain supported. Command IDs, settings keys, undo semantics and labels remain.

## Alternatives considered

- Raw insertion: fails the destination boundary.
- Percent-encode all delimiters: simple but may change reserved URL semantics.
- Normalize every input with URL.href: changes ordinary spelling and backslash
  interpretation; unnecessary for this patch.
- Add a general Markdown parser dependency: not needed for bounded serialization.

## Consequences

New destinations containing delimiters have explicit Markdown escaping. Ordinary
URLs remain unchanged. Serializer, unwrap and executor require regression cases;
CommonMark specifies escaped destination punctuation, but mocked Obsidian DOM
cannot replace native renderer acceptance. See
[CommonMark links](https://spec.commonmark.org/0.31.2/#links).
