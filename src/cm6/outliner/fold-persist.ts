import { isolateHistory } from "@codemirror/commands";
import {
  ensureSyntaxTree,
  foldable,
  foldEffect,
  foldedRanges,
  foldState,
  unfoldEffect,
} from "@codemirror/language";
import { Annotation, type EditorState } from "@codemirror/state";
import { EditorView, ViewPlugin, type ViewUpdate } from "@codemirror/view";
import { getAllListItems } from "@/cm6/list-service";
import type TypewriterModeLib from "@/lib";
import { collectBlockIds, generateUniqueBlockId } from "./block-id";
import { foldEditorContext } from "./fold-context";
import { captureFolds, restoreFolds, uniqueBlockIds } from "./fold-model";
import { getVisibleRange } from "./utils";

export const internalFoldChange = Annotation.define<boolean>();

function listFolds(state: EditorState) {
  return getAllListItems(state).flatMap((item) => {
    const line = state.doc.lineAt(item.from);
    const range = foldable(state, line.from, line.to);
    return range ? [{ ...range, lineEnd: line.to, id: item.blockId }] : [];
  });
}

function identifiedFolds(state: EditorState) {
  const ids = uniqueBlockIds(state.doc.toString());
  return listFolds(state).flatMap((item) =>
    item.id && ids.has(item.id) ? [{ ...item, id: item.id }] : []
  );
}

/** Owns callbacks in the editor's window. No active-pane lookup or idle polling. */
export function createFoldPersistExtension(tm: TypewriterModeLib) {
  return ViewPlugin.fromClass(
    class {
      private frame: number | null = null;
      private disposed = false;
      private file: object | null = null;
      private path: string | null = null;
      private restoring = false;
      private enabled = false;
      private starts = new Set<number>();
      private pendingState: EditorState | null = null;
      private action = 0;
      private readonly win: Window;

      private readonly view: EditorView;
      constructor(view: EditorView) {
        this.view = view;
        this.win = view.dom.ownerDocument.defaultView ?? window;
        this.syncContext();
      }

      private syncContext(): void {
        const wanted =
          tm.settings.foldPersist.isFoldPersistEnabled ||
          (tm.settings.blockId.isBlockIdEnabled &&
            tm.settings.blockId.isAutoGenerateOnFoldEnabled);
        const context = wanted ? foldEditorContext(tm, this.view) : null;
        const enabled =
          !!context && tm.settings.foldPersist.isFoldPersistEnabled;
        const file = context?.file ?? null;
        const path = context?.path ?? null;
        if (
          file !== this.file ||
          path !== this.path ||
          enabled !== this.enabled
        ) {
          this.cancel();
          tm.foldPersistence.cancelOwner(this);
          this.file = file;
          this.path = path;
          this.enabled = enabled;
          this.restoring = enabled;
          if (enabled) {
            this.schedule(() => this.restore(0));
          }
        }
      }

      update(update: ViewUpdate): void {
        this.syncContext();
        if (
          !this.path ||
          this.disposed ||
          !update.state.field(foldState, false)
        ) {
          return;
        }
        const transactions = update.transactions.filter(
          (tr) => !tr.annotation(internalFoldChange)
        );
        const effects = transactions
          .flatMap((tr) => tr.effects)
          .filter((effect) => effect.is(foldEffect) || effect.is(unfoldEffect));
        if (!effects.length) {
          return;
        }
        this.action = tm.foldPersistence.claim(this.path);
        this.restoring = false;
        if (this.pendingState?.doc !== update.state.doc) {
          this.starts.clear();
        }
        if (
          transactions.some(
            (tr) => tr.isUserEvent("undo") || tr.isUserEvent("redo")
          )
        ) {
          this.starts.clear();
        } else {
          for (const effect of effects) {
            if (effect.is(foldEffect)) {
              this.starts.add(effect.value.from);
            }
          }
        }
        this.pendingState = update.state;
        this.schedule(() => this.process(0));
      }

      private process(attempt: number): void {
        const state = this.view.state;
        const context = foldEditorContext(tm, this.view);
        if (
          !this.pendingState ||
          state.doc !== this.pendingState.doc ||
          !context ||
          context.file !== this.file ||
          context.path !== this.path
        ) {
          this.starts.clear();
          return;
        }
        if (!ensureSyntaxTree(state, state.doc.length, 20)) {
          if (attempt < 2) {
            this.schedule(() => this.process(attempt + 1));
          }
          return;
        }
        const starts = this.starts;
        this.starts = new Set();
        this.pendingState = null;
        if (this.autoId(state, starts)) {
          this.pendingState = this.view.state;
          this.schedule(() => this.process(0));
          return;
        }
        if (
          this.enabled &&
          this.path &&
          tm.settings.foldPersist.isFoldPersistEnabled
        ) {
          tm.foldPersistence.capture(
            this.path,
            captureFolds(state, identifiedFolds(state)),
            this,
            this.win,
            this.action
          );
        }
      }

      private restore(attempt: number): void {
        const context = foldEditorContext(tm, this.view);
        if (
          !(
            this.restoring &&
            this.path &&
            tm.settings.foldPersist.isFoldPersistEnabled &&
            context &&
            context.file === this.file &&
            context.path === this.path
          )
        ) {
          return;
        }
        const state = this.view.state;
        if (
          !(
            state.field(foldState, false) &&
            ensureSyntaxTree(state, state.doc.length, 20)
          )
        ) {
          if (attempt < 2) {
            this.schedule(() => this.restore(attempt + 1));
          }
          return;
        }
        this.restoring = false;
        const effects = restoreFolds(
          state,
          identifiedFolds(state),
          tm.foldPersistence.read(this.path)
        );
        if (effects.length) {
          this.view.dispatch({
            effects,
            annotations: internalFoldChange.of(true),
          });
        }
      }

      private autoId(state: EditorState, starts: Set<number>): boolean {
        const settings = tm.settings;
        if (
          !(
            starts.size &&
            settings.blockId.isBlockIdEnabled &&
            settings.blockId.isAutoGenerateOnFoldEnabled
          ) ||
          settings.hemingwayMode.isHemingwayModeEnabled ||
          state.readOnly ||
          !state.facet(EditorView.editable)
        ) {
          return false;
        }
        const folded = new Set<number>();
        for (
          let cursor = foldedRanges(state).iter();
          cursor.value;
          cursor.next()
        ) {
          folded.add(cursor.from);
        }
        const visible = getVisibleRange(state);
        const ids = collectBlockIds(state.doc.toString());
        const changes = listFolds(state)
          .filter(
            (item) =>
              !item.id &&
              starts.has(item.from) &&
              folded.has(item.from) &&
              (!visible ||
                (item.lineEnd >= visible.from && item.lineEnd <= visible.to))
          )
          .map((item) => ({
            from: item.lineEnd,
            insert: ` ^${generateUniqueBlockId(ids)}`,
          }));
        if (!changes.length) {
          return false;
        }
        this.view.dispatch({
          changes,
          annotations: [internalFoldChange.of(true), isolateHistory.of("full")],
          userEvent: "input.block-id",
        });
        return true;
      }

      private schedule(callback: () => void): void {
        if (this.frame !== null) {
          this.win.cancelAnimationFrame(this.frame);
        }
        this.frame = this.win.requestAnimationFrame(() => {
          this.frame = null;
          if (!(this.disposed || tm.foldPersistence.isDisposed)) {
            try {
              callback();
            } catch (error) {
              console.error("MD Writer: fold operation failed", error);
            }
          }
        });
      }

      private cancel(): void {
        if (this.frame !== null) {
          this.win.cancelAnimationFrame(this.frame);
        }
        this.frame = null;
        this.starts.clear();
        this.pendingState = null;
      }

      destroy(): void {
        this.disposed = true;
        this.cancel();
        tm.foldPersistence.cancelOwner(this);
      }
    }
  );
}
