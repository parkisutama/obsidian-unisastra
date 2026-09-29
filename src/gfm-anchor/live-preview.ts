import { type EditorView, ViewPlugin, type ViewUpdate } from "@codemirror/view";
import type { App, TFile } from "obsidian";
import { editorInfoField, editorLivePreviewField } from "obsidian";
import { rewriteAnchorForPreview } from "./reading-mode";

const ANCHOR_SELECTOR = 'a.internal-link, a[data-href*="#"], a[href^="#"]';

export function createLivePreviewPlugin(app: App, isEnabled: () => boolean) {
  return ViewPlugin.fromClass(
    class {
      private readonly view: EditorView;
      private rafId = 0;
      private disposed = false;
      private enabled = isEnabled();
      private readonly observer: MutationObserver;
      private readonly metadataRef;
      private readonly resolvedRef;
      private readonly sourceRef;

      private get ownerWindow() {
        return this.view.dom.ownerDocument.defaultView ?? window;
      }

      constructor(view: EditorView) {
        this.view = view;
        this.observer = new MutationObserver((mutations) => {
          const hasAnchor = (node: Node) => {
            const element = node as Element;
            return (
              element.matches?.(ANCHOR_SELECTOR) ||
              element.querySelector?.(ANCHOR_SELECTOR)
            );
          };
          if (
            mutations.some((mutation) =>
              mutation.type === "attributes"
                ? (mutation.target as Element).matches?.(ANCHOR_SELECTOR)
                : Array.from(mutation.addedNodes).some(hasAnchor)
            )
          ) {
            this.scheduleRewrite();
          }
        });
        this.observe();
        this.metadataRef = app.metadataCache.on("changed", () =>
          this.scheduleRewrite()
        );
        this.resolvedRef = app.metadataCache.on("resolved", () =>
          this.scheduleRewrite()
        );
        this.sourceRef = app.workspace.on("file-open", () =>
          this.scheduleRewrite()
        );
        this.scheduleRewrite();
      }

      update(update: ViewUpdate): void {
        const enabled = isEnabled();
        if (enabled !== this.enabled) {
          this.enabled = enabled;
          this.observer.disconnect();
          this.observe();
          this.scheduleRewrite();
        } else if (
          update.docChanged ||
          update.viewportChanged ||
          update.transactions.some((tr) => tr.reconfigured)
        ) {
          this.scheduleRewrite();
        }
      }

      destroy(): void {
        this.disposed = true;
        this.observer.disconnect();
        app.metadataCache.offref(this.metadataRef);
        app.metadataCache.offref(this.resolvedRef);
        app.workspace.offref(this.sourceRef);
        this.ownerWindow.cancelAnimationFrame(this.rafId);
      }

      private observe(): void {
        if (!this.disposed && isEnabled()) {
          this.observer.observe(this.view.contentDOM, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["href", "data-href", "class"],
          });
        }
      }

      private scheduleRewrite(): void {
        if (this.disposed || !isEnabled()) {
          this.ownerWindow.cancelAnimationFrame(this.rafId);
          this.rafId = 0;
          return;
        }
        if (this.rafId) {
          return;
        }
        this.rafId = this.ownerWindow.requestAnimationFrame(() => {
          this.rafId = 0;
          if (this.disposed) {
            return;
          }
          this.observer.disconnect();
          try {
            this.rewriteAnchors();
          } catch (error: unknown) {
            console.warn(
              "[unisastra] GFM anchor Live Preview rewrite failed",
              error
            );
          } finally {
            this.observe();
          }
        });
      }

      private rewriteAnchors(): void {
        if (!(isEnabled() && isLivePreview(this.view))) {
          return;
        }

        const file = getFileFromView(this.view);
        if (!file) {
          return;
        }

        const anchors = Array.from(
          this.view.contentDOM.querySelectorAll<HTMLAnchorElement>(
            ANCHOR_SELECTOR
          )
        );

        for (const anchor of anchors) {
          rewriteAnchorForPreview(app, anchor, file.path);
        }
      }
    },
    {
      eventHandlers: {
        mouseover(event: MouseEvent, view: EditorView) {
          if (!(isEnabled() && isLivePreview(view))) {
            return;
          }

          const target = event.target;
          if (!(target instanceof HTMLElement)) {
            return;
          }

          const anchor = target.closest<HTMLAnchorElement>(ANCHOR_SELECTOR);
          const file = getFileFromView(view);
          if (!(anchor && file)) {
            return;
          }

          rewriteAnchorForPreview(app, anchor, file.path);
        },
      },
    }
  );
}

function getFileFromView(view: EditorView): TFile | null {
  try {
    return view.state.field(editorInfoField).file;
  } catch {
    return null;
  }
}

function isLivePreview(view: EditorView): boolean {
  try {
    return view.state.field(editorLivePreviewField);
  } catch {
    return false;
  }
}
