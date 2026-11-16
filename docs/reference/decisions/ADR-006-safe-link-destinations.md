# ADR-006: Safe Markdown link destinations

- Date: 2026-11-16.
- Status: Accepted and implemented (#36). Native acceptance passed on Obsidian
  1.15.1 desktop on 2026-11-16; see the
  [hardening ledger](../../specs/security-hardening/tasks.md).
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
