import { EditorView } from "@codemirror/view";
import { MarkdownView, Notice, Platform } from "obsidian";
import { getVisibleRange } from "@/cm6/outliner/utils";
import type TypewriterModeLib from "@/lib";
import type { ToolbarAction } from "./actions";
import { executeToolbarAction, type ToolbarTarget } from "./executor";
import type { ToolbarSettings } from "./settings";

export function dockVisibility(
  mode: ToolbarSettings["mode"],
  persistent: boolean,
  visible: boolean,
  event: "typing" | "leave" | "reveal"
): boolean {
  if (mode !== "dock") {
    return false;
  }
  if (persistent || event === "reveal") {
    return true;
  }
  return event === "typing" || event === "leave" ? false : visible;
}
export interface ToolbarSurface {
  destroy: () => void;
  update: (view: EditorView | null, settings: ToolbarSettings) => void;
}
export type SurfaceFactory = (
  doc: Document,
  execute: (action: ToolbarAction) => void
) => ToolbarSurface;

export class ToolbarController {
  private readonly editors = new Set<EditorView>();
  private readonly active = new Map<Document, EditorView>();
  private readonly surfaces = new Map<Document, ToolbarSurface>();
  private readonly frames = new Map<Document, number>();
  private disposed = false;
  private factory: SurfaceFactory | null = null;
  private readonly tm: TypewriterModeLib;
  constructor(tm: TypewriterModeLib) {
    this.tm = tm;
  }

  setSurfaceFactory(factory: SurfaceFactory): void {
    this.factory = factory;
    this.refresh();
  }
  load(): void {
    const workspace = this.tm.plugin.app.workspace;
    this.tm.plugin.registerEvent(
      workspace.on("active-leaf-change", (leaf) => {
        const view = leaf?.view;
        if (!view) {
          return;
        }
        const doc = view.containerEl.ownerDocument;
        const cm =
          view instanceof MarkdownView
            ? (view.editor as unknown as { cm?: EditorView }).cm
            : undefined;
        if (cm && this.editors.has(cm)) {
          this.active.set(doc, cm);
        } else {
          this.active.delete(doc);
        }
        this.schedule(doc);
      })
    );
    this.tm.plugin.registerEvent(
      workspace.on("window-close", (_host, win) =>
        this.closeWindow(win.document)
      )
    );
    workspace.onLayoutReady(() => this.refresh());
  }
  attach(view: EditorView): void {
    if (this.disposed || Platform.isMobile) {
      return;
    }
    this.editors.add(view);
    this.changed(view);
  }
  changed(view: EditorView): void {
    const doc = view.dom.ownerDocument;
    if (view.hasFocus || !this.active.has(doc)) {
      this.active.set(doc, view);
    }
    this.schedule(doc);
  }
  detach(view: EditorView): void {
    this.editors.delete(view);
    const doc = view.dom.ownerDocument;
    if (this.active.get(doc) === view) {
      this.active.delete(doc);
    }
    this.schedule(doc);
  }
  private markdownView(cm: EditorView): MarkdownView | null {
    for (const leaf of this.tm.plugin.app.workspace.getLeavesOfType(
      "markdown"
    )) {
      if (
        leaf.view instanceof MarkdownView &&
        (leaf.view.editor as unknown as { cm?: EditorView }).cm === cm
      ) {
        return leaf.view;
      }
    }
    return null;
  }
  target(view: EditorView): ToolbarTarget {
    const doc = view.dom.ownerDocument;
    const source = this.markdownView(view);
    const path = source?.file?.path;
    return {
      get state() {
        return view.state;
      },
      dispatch: (spec) => view.dispatch(spec),
      readClipboardText: () => {
        const clipboard = doc.defaultView?.navigator.clipboard;
        if (!clipboard?.readText) {
          return Promise.reject(new Error("Clipboard access unavailable."));
        }
        return clipboard.readText();
      },
      policy: () => {
        const sourceNow = this.markdownView(view);
        const general = this.tm.settings.general;
        const frontmatter = sourceNow?.file
          ? this.tm.plugin.app.metadataCache.getFileCache(sourceNow.file)
              ?.frontmatter
          : undefined;
        return {
          enabled:
            this.tm.settings.toolbar.enabled &&
            general.isPluginActivated &&
            general.enabledPlatforms !== "mobile" &&
            !Platform.isMobile &&
            frontmatter?.["md-writer"] !== false,
          current:
            !this.disposed &&
            this.active.get(doc) === view &&
            view.dom.isConnected &&
            view.state.facet(EditorView.editable) &&
            sourceNow !== null &&
            sourceNow.getMode() === "source" &&
            sourceNow.file?.path === path,
          hemingway: this.tm.settings.hemingwayMode.isHemingwayModeEnabled,
          smartUrl: this.tm.settings.toolbar.smartUrl,
          visible: getVisibleRange(view.state),
        };
      },
    };
  }
  execute(doc: Document, action: ToolbarAction): void {
    const view = this.active.get(doc);
    if (!view) {
      return;
    }
    Promise.resolve(executeToolbarAction(this.target(view), action))
      .then((issue) => {
        if (issue) {
          new Notice(issue);
        } else {
          view.focus();
        }
        this.schedule(doc);
      })
      .catch((error: unknown) => {
        console.error("MD Writer: toolbar action failed.", error);
      });
  }
  refresh(): void {
    for (const doc of new Set([
      ...this.active.keys(),
      ...this.surfaces.keys(),
    ])) {
      this.schedule(doc);
    }
  }
  private schedule(doc: Document): void {
    const win = doc.defaultView;
    if (this.disposed || !win || this.frames.has(doc)) {
      return;
    }
    const frame = win.requestAnimationFrame(() => {
      this.frames.delete(doc);
      this.render(doc);
    });
    this.frames.set(doc, frame);
  }
  private render(doc: Document): void {
    const view = this.active.get(doc);
    const target = view ? this.target(view).policy() : null;
    if (!(target?.enabled && target.current && this.factory)) {
      this.surfaces.get(doc)?.destroy();
      this.surfaces.delete(doc);
      return;
    }
    let surface = this.surfaces.get(doc);
    if (!surface) {
      surface = this.factory(doc, (action) => this.execute(doc, action));
      this.surfaces.set(doc, surface);
    }
    surface.update(view ?? null, this.tm.settings.toolbar);
  }
  private closeWindow(doc: Document): void {
    const frame = this.frames.get(doc);
    if (frame !== undefined) {
      doc.defaultView?.cancelAnimationFrame(frame);
    }
    this.frames.delete(doc);
    this.surfaces.get(doc)?.destroy();
    this.surfaces.delete(doc);
    this.active.delete(doc);
    for (const view of this.editors) {
      if (view.dom.ownerDocument === doc) {
        this.editors.delete(view);
      }
    }
  }
  destroy(): void {
    this.disposed = true;
    for (const doc of new Set([
      ...this.frames.keys(),
      ...this.surfaces.keys(),
    ])) {
      this.closeWindow(doc);
    }
    this.editors.clear();
    this.active.clear();
  }
}
