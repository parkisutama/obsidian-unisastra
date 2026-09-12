import { EditorView } from "@codemirror/view";
import { MarkdownView, Notice, Platform } from "obsidian";
import { getVisibleRange } from "@/cm6/outliner/utils";
import type TypewriterModeLib from "@/lib";
import type { ToolbarAction } from "./actions";
import {
  type ElapsedState,
  EMPTY_FILE_ELAPSED,
  elapsedMs,
  type FileElapsedState,
  nextFileElapsedState,
  STOPPED_ELAPSED,
  startElapsed,
} from "./elapsed";
import { executeToolbarAction, type ToolbarTarget } from "./executor";
import { hudSegments } from "./hud";
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
export type DockEvent = "typing" | "leave" | "reveal";
export interface ToolbarElapsedSnapshot {
  readonly fileMs: number;
  readonly sessionMs: number;
}
export interface ToolbarSurface {
  destroy: () => void;
  update: (
    view: EditorView | null,
    settings: ToolbarSettings,
    dockVisible: boolean,
    elapsed: ToolbarElapsedSnapshot
  ) => void;
}
export type SurfaceFactory = (
  doc: Document,
  execute: (action: ToolbarAction) => void,
  reportDockEvent: (event: DockEvent) => void,
  resetSession: () => void
) => ToolbarSurface;

export class ToolbarController {
  private readonly editors = new Set<EditorView>();
  private readonly active = new Map<Document, EditorView>();
  private readonly surfaces = new Map<Document, ToolbarSurface>();
  private readonly frames = new Map<Document, number>();
  private readonly dockVisible = new Map<Document, boolean>();
  private readonly fileElapsed = new Map<Document, FileElapsedState>();
  private session: ElapsedState = STOPPED_ELAPSED;
  private statusBarEl: HTMLElement | null = null;
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
        this.syncFileElapsed(view, doc);
        this.schedule(doc);
      })
    );
    this.tm.plugin.registerEvent(
      workspace.on("file-open", () => {
        const view = workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
          return;
        }
        const doc = view.containerEl.ownerDocument;
        this.syncFileElapsed(view, doc);
        this.schedule(doc);
      })
    );
    this.tm.plugin.registerEvent(
      workspace.on("window-close", (_host, win) =>
        this.closeWindow(win.document)
      )
    );
    this.syncSession();
    workspace.onLayoutReady(() => this.refresh());
  }
  private syncFileElapsed(view: unknown, doc: Document): void {
    const activePath =
      view instanceof MarkdownView ? (view.file?.path ?? null) : null;
    this.fileElapsed.set(
      doc,
      nextFileElapsedState(
        this.fileElapsed.get(doc) ?? EMPTY_FILE_ELAPSED,
        activePath,
        Date.now()
      )
    );
  }
  private syncSession(): void {
    const enabled = this.tm.settings.toolbar.enabled;
    if (enabled && this.session.startedAt === null) {
      this.session = startElapsed(Date.now());
    } else if (!enabled && this.session.startedAt !== null) {
      this.session = STOPPED_ELAPSED;
      this.fileElapsed.clear();
    }
  }
  resetSession(): void {
    if (this.session.startedAt !== null) {
      this.session = startElapsed(Date.now());
    }
  }
  getSessionElapsedMs(now = Date.now()): number {
    return elapsedMs(this.session, now);
  }
  getFileElapsedMs(doc: Document, now = Date.now()): number {
    const state = this.fileElapsed.get(doc);
    return state ? elapsedMs(state.elapsed, now) : 0;
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
  notifyTyping(view: EditorView): void {
    this.reportDockEvent(view.dom.ownerDocument, "typing");
  }
  reportDockEvent(doc: Document, event: DockEvent): void {
    if (this.disposed) {
      return;
    }
    const toolbar = this.tm.settings.toolbar;
    const current = this.dockVisible.get(doc) ?? true;
    this.dockVisible.set(
      doc,
      dockVisibility(toolbar.mode, toolbar.dockAlwaysVisible, current, event)
    );
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
    this.syncSession();
    for (const doc of new Set([
      ...this.active.keys(),
      ...this.surfaces.keys(),
    ])) {
      this.reportDockEvent(doc, "reveal");
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
      this.dockVisible.delete(doc);
      this.updateStatusBarHud(doc, false);
      return;
    }
    let surface = this.surfaces.get(doc);
    if (!surface) {
      surface = this.factory(
        doc,
        (action) => this.execute(doc, action),
        (event) => this.reportDockEvent(doc, event),
        () => this.resetSession()
      );
      this.surfaces.set(doc, surface);
    }
    const toolbar = this.tm.settings.toolbar;
    surface.update(view ?? null, toolbar, this.dockVisible.get(doc) ?? true, {
      sessionMs: this.getSessionElapsedMs(),
      fileMs: this.getFileElapsedMs(doc),
    });
    this.updateStatusBarHud(doc, toolbar.mode === "floating");
  }
  private isMainWindowDocument(doc: Document): boolean {
    return this.tm.plugin.app.workspace.containerEl.ownerDocument === doc;
  }
  private ensureStatusBarEl(): HTMLElement {
    if (!this.statusBarEl) {
      this.statusBarEl = this.tm.plugin.addStatusBarItem();
      this.statusBarEl.addClass("ptm-floaty-toolbar-status-bar-hud");
    }
    return this.statusBarEl;
  }
  private updateStatusBarHud(doc: Document, shouldShow: boolean): void {
    if (!(shouldShow && this.isMainWindowDocument(doc))) {
      this.statusBarEl?.hide();
      return;
    }
    const segments = hudSegments(
      this.tm.settings.toolbar.timers,
      this.getSessionElapsedMs(),
      this.getFileElapsedMs(doc)
    );
    if (segments.length === 0) {
      this.statusBarEl?.hide();
      return;
    }
    const el = this.ensureStatusBarEl();
    el.setText(segments.map((segment) => segment.label).join(" · "));
    el.title = segments.map((segment) => segment.tooltip).join(" ");
    el.show();
  }
  private closeWindow(doc: Document): void {
    const frame = this.frames.get(doc);
    if (frame !== undefined) {
      doc.defaultView?.cancelAnimationFrame(frame);
    }
    this.frames.delete(doc);
    this.surfaces.get(doc)?.destroy();
    this.surfaces.delete(doc);
    this.dockVisible.delete(doc);
    this.fileElapsed.delete(doc);
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
    this.session = STOPPED_ELAPSED;
    this.statusBarEl?.remove();
    this.statusBarEl = null;
  }
}
