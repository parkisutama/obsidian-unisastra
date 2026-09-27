import type { App, MarkdownPostProcessorContext } from "obsidian";
import {
  formatAnchor,
  getTargetFile,
  parseAnchor,
  resolveSlug,
} from "./resolver";

const READING_MODE_ANCHOR_SELECTOR =
  'a[href*="#"], a[data-href*="#"], a.internal-link';

export function registerReadingModePostProcessor(
  app: App,
  isEnabled: () => boolean
): (el: HTMLElement, ctx: MarkdownPostProcessorContext) => void {
  return (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    if (!isEnabled()) {
      return;
    }

    const anchors = Array.from(
      el.querySelectorAll<HTMLAnchorElement>(READING_MODE_ANCHOR_SELECTOR)
    );

    for (const anchor of anchors) {
      rewriteAnchorForPreview(app, anchor, ctx.sourcePath);
    }
  };
}

export function rewriteAnchorForPreview(
  app: App,
  anchor: HTMLAnchorElement,
  sourcePath: string
): void {
  const href = anchor.getAttribute("href");
  const dataHref = anchor.getAttribute("data-href");
  const previous = anchor.dataset.gfmRewrittenHref;
  // Live Preview may reuse an anchor while compatibility is disabled.
  const changedHref =
    previous && href !== null && href !== previous ? href : null;
  const changedDataHref =
    previous && dataHref !== null && dataHref !== previous ? dataHref : null;
  const raw =
    changedHref ??
    changedDataHref ??
    anchor.dataset.gfmOriginalHref ??
    anchor.getAttribute("data-href") ??
    anchor.getAttribute("href");
  if (!raw) {
    return;
  }

  const parsed = parseAnchor(raw);
  if (!parsed) {
    return;
  }

  const file = getTargetFile(app, parsed.filePart, sourcePath);
  if (!file) {
    return;
  }

  const heading = resolveSlug(parsed.fragment, file, app);
  if (!heading) {
    return;
  }

  anchor.dataset.gfmSlug = parsed.fragment;
  anchor.dataset.gfmOriginalHref = raw;

  const rewritten = formatAnchor(parsed.filePart, heading);
  anchor.dataset.gfmRewrittenHref = rewritten;
  anchor.setAttribute("href", rewritten);
  anchor.setAttribute("data-href", rewritten);
}
