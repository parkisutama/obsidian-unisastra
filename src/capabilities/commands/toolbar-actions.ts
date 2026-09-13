// Command IDs for the formatting/heading/callout actions match upstream
// Floaty Toolbar's own command IDs for palette parity:
// https://github.com/0png/Floaty-Toolbar, src/main.ts
// Revision b2113d06e1870851963053cd0bab0a0a971bb920.
// Copyright (c) 2026 0png. Full notice: licenses/floaty-toolbar-MIT.txt.
// "manage-callouts" has no upstream equivalent — it is new here.
import type { EditorView } from "@codemirror/view";
import type { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { Notice, Platform } from "obsidian";
import { AbstractCommand } from "@/capabilities/base/abstract-command";
import { Command } from "@/capabilities/base/command";
import type { ToolbarAction } from "@/capabilities/features/toolbar/actions";
import { executeToolbarAction } from "@/capabilities/features/toolbar/executor";
import type TypewriterModeLib from "@/lib";

function editorViewOf(editor: Editor): EditorView | null {
  return (editor as unknown as { cm?: EditorView }).cm ?? null;
}

/**
 * Registers one command that reuses the exact same executor/guards the
 * toolbar UI uses (`tm.toolbar.target()` + `executeToolbarAction`), so a
 * command-palette invocation is refused/accepted under the same conditions
 * as clicking the toolbar button (disabled/Reading Mode/Hemingway/stale
 * target/etc.). Hidden from the palette on mobile — the toolbar itself is
 * desktop-only — and when the active editor has no live CM6 view to target.
 */
function registerToolbarActionCommand(
  tm: TypewriterModeLib,
  id: string,
  name: string,
  action: ToolbarAction
): void {
  tm.plugin.addCommand({
    id,
    name,
    editorCheckCallback: (
      checking: boolean,
      editor: Editor,
      _ctx: MarkdownView | MarkdownFileInfo
    ): boolean => {
      if (Platform.isMobile) {
        return false;
      }
      const cm = editorViewOf(editor);
      if (!cm) {
        return false;
      }
      if (checking) {
        return true;
      }
      const target = tm.toolbar.target(cm);
      Promise.resolve(executeToolbarAction(target, action)).then((issue) => {
        if (issue) {
          new Notice(issue);
        }
      });
      return true;
    },
  });
}

export class ToolbarActionCommand extends AbstractCommand {
  private readonly _commandKey: string;
  private readonly _commandTitle: string;
  private readonly action: ToolbarAction;

  constructor(
    tm: TypewriterModeLib,
    commandKey: string,
    commandTitle: string,
    action: ToolbarAction
  ) {
    super(tm);
    this._commandKey = commandKey;
    this._commandTitle = commandTitle;
    this.action = action;
  }

  get commandKey(): string {
    return this._commandKey;
  }

  get commandTitle(): string {
    return this._commandTitle;
  }

  protected override registerCommand(): void {
    registerToolbarActionCommand(
      this.tm,
      this.commandKey,
      this.commandTitle,
      this.action
    );
  }

  override load(): void {
    this.registerCommand();
  }
}

const TOOLBAR_ACTION_COMMANDS: ReadonlyArray<{
  readonly action: ToolbarAction;
  readonly id: string;
  readonly name: string;
}> = [
  { id: "floaty-bold", name: "Toolbar: Bold", action: { kind: "bold" } },
  { id: "floaty-italic", name: "Toolbar: Italic", action: { kind: "italic" } },
  {
    id: "floaty-strikethrough",
    name: "Toolbar: Strikethrough",
    action: { kind: "strikethrough" },
  },
  {
    id: "floaty-inline-code",
    name: "Toolbar: Inline code",
    action: { kind: "code" },
  },
  {
    id: "floaty-highlight",
    name: "Toolbar: Highlight",
    action: { kind: "highlight" },
  },
  {
    id: "floaty-insert-link",
    name: "Toolbar: Insert link",
    action: { kind: "link" },
  },
  {
    id: "floaty-heading-1",
    name: "Toolbar: Heading 1",
    action: { kind: "heading", level: 1 },
  },
  {
    id: "floaty-heading-2",
    name: "Toolbar: Heading 2",
    action: { kind: "heading", level: 2 },
  },
  {
    id: "floaty-heading-3",
    name: "Toolbar: Heading 3",
    action: { kind: "heading", level: 3 },
  },
  {
    id: "floaty-heading-4",
    name: "Toolbar: Heading 4",
    action: { kind: "heading", level: 4 },
  },
  {
    id: "floaty-heading-plain",
    name: "Toolbar: Remove heading",
    action: { kind: "heading", level: 0 },
  },
  {
    id: "floaty-callout-note",
    name: "Toolbar: Callout - Note",
    action: { kind: "callout", id: "note" },
  },
  {
    id: "floaty-callout-tip",
    name: "Toolbar: Callout - Tip",
    action: { kind: "callout", id: "tip" },
  },
  {
    id: "floaty-callout-warning",
    name: "Toolbar: Callout - Warning",
    action: { kind: "callout", id: "warning" },
  },
  {
    id: "floaty-callout-important",
    name: "Toolbar: Callout - Important",
    action: { kind: "callout", id: "important" },
  },
  {
    id: "floaty-callout-caution",
    name: "Toolbar: Callout - Caution",
    action: { kind: "callout", id: "caution" },
  },
];

export function toolbarActionCommands(
  tm: TypewriterModeLib
): ToolbarActionCommand[] {
  return TOOLBAR_ACTION_COMMANDS.map(
    ({ id, name, action }) => new ToolbarActionCommand(tm, id, name, action)
  );
}

export class ManageCalloutsCommand extends Command {
  readonly commandKey = "manage-callouts";
  readonly commandTitle = "Manage callouts";

  protected onCommand(): void {
    this.tm.openCalloutManager();
  }
}
