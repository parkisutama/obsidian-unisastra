---
title: MD Writer Outliner Integration — URD, PRD, and Implementation Plan
created: 2026-03-19T21:00
modified: 2026-03-19T21:00
tags:
  - obsidian
  - plugin
  - prd
  - urd
  - outliner
  - cm6
---

## MD Writer Outliner Integration

This document serves as the complete specification for integrating
Logseq-style outliner capabilities into the `obsidian-md-writer` plugin.
It is structured for LLM-assisted implementation (GitHub Copilot).

---

### Part 1 — User Requirements Document (URD)

#### 1.1 Vision

Transform MD Writer from a typewriter-focused writing tool into a
complete writing environment that includes Logseq-quality outliner
capabilities.
The user should be able to think in bullets,
reorganize ideas fluidly,
and link individual thoughts across files —
all without leaving Obsidian or installing separate plugins.

#### 1.2 User stories

Each story has acceptance criteria (AC) written as testable conditions.

##### US-01: Fast hierarchical capture

> As a writer,
> I want to dump ideas as nested bullets using keyboard shortcuts,
> so my thinking flow is never interrupted by formatting decisions.

AC:

- Pressing Enter on a non-empty list item creates a new sibling item below
- Pressing Enter on an empty list item outdents it one level
  (or exits list mode if already at root)
- Pressing Tab indents the current item under the previous sibling
- Pressing Shift+Tab outdents the current item one level
- All operations preserve the subtree of children correctly
- Works identically in Live Preview and Source mode

##### US-02: Fluid reorganization

> As a writer,
> I want to move a bullet and all its children up or down with a hotkey,
> so reorganizing my outline feels as fast as thinking.

AC:

- Ctrl/Cmd+Shift+Up moves the current item and all children up one sibling position
- Ctrl/Cmd+Shift+Down moves the current item and all children down one sibling position
- Moving respects list boundaries — cannot move past the first or last sibling
- Indentation of the moved subtree is preserved exactly
- Numbered lists re-number correctly after move
- Cursor position within the item text is preserved after move

##### US-03: Zoom focus (already implemented — upgrade)

> As a writer,
> I want to zoom into a single bullet and work inside it as my whole document,
> so I can focus without visual noise.

AC (existing, preserved):

- Cmd/Ctrl+. zooms into the current heading or list item
- Cmd/Ctrl+Shift+. zooms out to full document
- Clicking a bullet point zooms into that item (when enabled)
- Navigation back out of focus is handled by commands and the sidebar outline, without an in-editor breadcrumb bar
- Selection is limited to the visible range when zoomed

AC (new — Lezer migration):

- Zoom range is calculated from the Lezer syntax tree, not `foldable()`
- Zoom correctly identifies ListItem subtrees including deeply nested children
- Zoom works on headings AND list items via the same Lezer tree path

##### US-05: Sidebar outline navigation

> As a writer,
> I want to see my bullet hierarchy in a sidebar panel,
> so I can jump around a long note without scrolling.

AC:

- A sidebar view titled "Outline" is available via the View menu
- The sidebar displays both headings and list items in a nested tree
- Clicking an entry scrolls the editor to that position
- The tree updates live as the document changes
- The currently visible item is highlighted in the tree
- Indentation in the sidebar matches document hierarchy depth

##### US-06: Persistent fold state

> As a writer,
> I want my folded bullets to stay folded when I reopen a note,
> so I do not lose my working view.

AC:

- When a user folds a list item and closes the file, reopening restores the fold
- Fold state is stored in `data.json` keyed by the file path and block ID
- If a block ID does not exist on a folded item, one is auto-generated
- Fold state survives Obsidian restart
- Renaming a file updates the fold state keys
- Deleting a file removes its fold state entries

##### US-07: Invisible block IDs

> As a writer,
> I want every important bullet to have a stable ID that I never have to see,
> so I can link to specific thoughts without visual clutter.

AC:

- A command "Generate block ID" assigns a `^id` to the current list item if none exists
- The ID format is `^ol-XXXXX` where XXXXX is a 5-character alphanumeric string
- Block IDs are visually hidden in the editor via CM6 decorations
- Block IDs are NOT hidden in Source mode (they are part of the markdown)
- MetadataCache automatically indexes the block IDs (native Obsidian behavior)
- Auto-generation occurs only when explicitly triggered or when needed by fold persist

##### US-08: Block linking and embedding

> As a writer,
> I want to copy a link or embed reference to any bullet with a command,
> so I can connect ideas across files without memorizing IDs.

AC:

- Command "Copy block link" copies `[[filename^block-id]]` to clipboard
- Command "Copy block embed" copies `![[filename^block-id]]` to clipboard
- If the current item has no block ID, one is auto-generated before copying
- A notice confirms the copy action
- The commands appear in the command palette and can be assigned hotkeys

##### US-09: Cursor discipline

> As a writer,
> I want the cursor to stay on the text content of a bullet,
> so I never accidentally break the list marker.

AC:

- Left arrow at the start of text content does not move into the bullet marker area
- Home key moves to the start of text content, not the start of the line
- Backspace at the start of text content does not delete the bullet marker
- This behavior can be toggled on/off in settings

##### US-10: Smart select

> As a writer,
> I want Cmd/Ctrl+A to first select the current item,
> then the full list,
> so I get block-level selection like a real outliner.

AC:

- First Cmd/Ctrl+A selects the current list item text
- Second Cmd/Ctrl+A selects the entire list
- Third Cmd/Ctrl+A selects the entire document (default Obsidian behavior)
- This behavior can be toggled on/off in settings

---

#### 1.3 Out of scope

- Dataview or any external query system
- Cross-file bullet aggregation (tasks view across vault)
- Numbered heading renumbering
- Real-time collaborative editing
- Mobile-specific touch gestures

---

### Part 2 — Product Requirements Document (PRD)

#### 2.1 Architecture decision: Lezer tree as single source of truth

All outliner operations read list hierarchy from CM6's Lezer syntax tree via
`syntaxTree(state)` from `@codemirror/language`.
This replaces the current `foldable()` approach in `calculate-range.ts`.

Rationale:

- `foldable()` only answers "can this line fold, and to where?" —
  it does not expose node types, parent-child relationships, or sibling ordering
- Keyboard ops need to know "what is the previous sibling ListItem?" —
  only the Lezer tree provides this
- Using one source for all features eliminates the class of bugs where
  two parsers disagree about document structure

#### 2.2 Lezer node types in Obsidian's markdown parser

Obsidian uses `@lezer/markdown` which produces these node types for lists:

| Node type | Role | Example |
| --- | --- | --- |
| `BulletList` | Container for `-` items | The entire `- a \n  - b` block |
| `OrderedList` | Container for `1.` items | The entire `1. a \n 2. b` block |
| `ListItem` | One item in a list | `- text\n  - child` (includes children) |
| `ListMark` | The bullet or number | `-` or `1.` |
| `TaskMarker` | The checkbox | `[ ]` or `[x]` |
| `Paragraph` | Text content inside an item | The text after the marker |

Key structural properties:

- `ListItem.from` is the start of the line (including indentation)
- `ListItem.to` includes all nested children
- Nesting depth is determined by counting `ListItem` ancestors
- Sibling order is the order of `ListItem` children within their parent `BulletList`/`OrderedList`
- A `ListItem` may contain a nested `BulletList` or `OrderedList` as a child node

#### 2.3 `data.json` schema additions

Current `data.json` stores settings and cursor positions.
Two new top-level keys are added:

```typescript
interface MdWriterData {
  // ... existing settings ...

  // New: fold state per file
  foldState: Record<string, Record<string, boolean>>;
  // Outer key = file path, inner key = block ID, value = isFolded

  // New: block index for fast lookup (optional optimization)
  blockIndex: Record<string, string[]>;
  // Key = file path, value = array of block IDs in that file
}
```

The `foldState` structure example:

```json
{
  "foldState": {
    "notes/project.md": {
      "ol-a1b2c": true,
      "ol-d3e4f": true
    }
  }
}
```

#### 2.4 Settings schema

##### Extended OutlinerSettings

```typescript
export interface OutlinerSettings {
  // Zoom (existing)
  isOutlinerEnabled: boolean;
  isOutlinerOnClickEnabled: boolean;

  // Keyboard operations (new)
  isKeyboardOpsEnabled: boolean;
  isCursorStickEnabled: boolean;
  isSmartEnterEnabled: boolean;
  isSmartTabEnabled: boolean;
  isSmartSelectEnabled: boolean;

  // Sidebar outline (new)
  isSidebarOutlineEnabled: boolean;
}
```

##### New BlockIdSettings

```typescript
export interface BlockIdSettings {
  isBlockIdEnabled: boolean;
  isAutoGenerateOnFoldEnabled: boolean;
  isHideIdsInLivePreviewEnabled: boolean;
}
```

##### New FoldPersistSettings

```typescript
export interface FoldPersistSettings {
  isFoldPersistEnabled: boolean;
}
```

##### Defaults

```typescript
const DEFAULT_OUTLINER_ADDITIONS = {
  isKeyboardOpsEnabled: true,
  isCursorStickEnabled: true,
  isSmartEnterEnabled: true,
  isSmartTabEnabled: true,
  isSmartSelectEnabled: false,
  isSidebarOutlineEnabled: true,
};

const DEFAULT_BLOCK_ID = {
  isBlockIdEnabled: true,
  isAutoGenerateOnFoldEnabled: true,
  isHideIdsInLivePreviewEnabled: true,
};

const DEFAULT_FOLD_PERSIST = {
  isFoldPersistEnabled: true,
};
```

##### WritingModePreset extension

```typescript
export interface WritingModePreset {
  // existing fields...
  outliner: boolean;
  hemingwayMode: boolean;
  writingFocus: boolean;
  typewriter: boolean;
  dimming: boolean;
  currentLine: boolean;
  showWhitespace: boolean;
  maxChars: boolean;
  // new
  outlinerKeyboard: boolean;
  outlinerDnd: boolean;
}
```

#### 2.5 Command table

| Command ID | Name | Default hotkey | Requires |
| --- | --- | --- | --- |
| `move-list-up` | Move list item up | Ctrl/Cmd+Shift+Up | keyboardOps |
| `move-list-down` | Move list item down | Ctrl/Cmd+Shift+Down | keyboardOps |
| `indent-list` | Indent list item | Tab (in list context) | smartTab |
| `outdent-list` | Outdent list item | Shift+Tab (in list context) | smartTab |
| `copy-block-link` | Copy block link | (none) | blockId |
| `copy-block-embed` | Copy block embed | (none) | blockId |
| `generate-block-id` | Generate block ID | (none) | blockId |
| `zoom-in` | Outliner: Focus on block | Cmd/Ctrl+. | (existing) |
| `zoom-out` | Outliner: Unfocus | Cmd/Ctrl+Shift+. | (existing) |

#### 2.6 Performance requirements

- Lezer tree queries must complete in under 5ms for documents up to 10,000 lines
- Sidebar outline must debounce updates by 200ms after document changes
- Fold state save must be debounced by 1000ms after fold change
- Block ID generation must not cause visible editor jank

---

### Part 3 — Implementation Plan

#### 3.0 Architectural principles

Rules for every module in this implementation:

- All `@codemirror/*` packages are marked `external` in `scripts/lib/build.ts` —
  Obsidian provides these at runtime; never bundle them
- `@lezer/common` is also external — import `SyntaxNode`, `Tree` from there
- Every new feature class extends `Feature` or `FeatureToggle` from
  `src/capabilities/base/`
- Every new command class extends `EditorCommand` or `Command` from
  `src/capabilities/base/`
- Settings use dotted-path access: `"outliner.isKeyboardOpsEnabled"`
- CM6 extensions that need runtime reconfiguration use `Compartment`
- No direct DOM manipulation — use CM6 decorations and state
- No barrel files — import directly from each module
- Follow Ultracite/Biome code standards (see `.claude/CLAUDE.md`)

#### 3.1 Phase 0 — Lezer list service (foundation)

**Goal**: Create the shared service that all other modules depend on.

##### File: `src/cm6/lezer-list-service.ts`

This module exports pure functions that query the Lezer syntax tree.
No state, no side effects, no CM6 extension registration.

```typescript
// src/cm6/lezer-list-service.ts

import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";

// ---- Types ----

export interface ListItemInfo {
  /** The Lezer ListItem node */
  node: SyntaxNode;
  /** Start offset in document (includes leading whitespace) */
  from: number;
  /** End offset (includes all nested children) */
  to: number;
  /** Nesting depth: 0 = root-level item */
  depth: number;
  /** Parent BulletList or OrderedList node */
  parentList: SyntaxNode;
  /** Whether this item has a nested sub-list */
  hasChildren: boolean;
  /** The list marker text (e.g. "-", "*", "1.") */
  marker: string;
  /** Whether this is a task item with checkbox */
  isTask: boolean;
  /** The text content of the item (excluding marker and children) */
  contentText: string;
  /** Start offset of the text content (after marker + space) */
  contentFrom: number;
  /** The block ID if present (e.g. "ol-a1b2c"), or null */
  blockId: string | null;
}

export interface DropTarget {
  /** The ListItem nearest to the drop position */
  item: ListItemInfo;
  /** Where to insert relative to this item */
  relation: "before" | "after" | "child";
}

// ---- Core query functions ----

/**
 * Resolve a document position to its enclosing ListItem.
 * Walks up from the given position until it finds a ListItem node.
 * Returns null if the position is not inside a list.
 */
export function resolveListItem(
  state: EditorState,
  pos: number
): ListItemInfo | null;

/**
 * Get all ListItem nodes in the visible portion of the document.
 * Uses syntaxTree(state).iterate() for efficiency.
 */
export function getAllListItems(
  state: EditorState
): ListItemInfo[];

/**
 * Get the full text of a subtree (item + all nested children).
 * Used by move operations to extract content.
 */
export function getSubtreeRange(
  state: EditorState,
  item: ListItemInfo
): { from: number; to: number; text: string };

/**
 * Find the previous sibling ListItem within the same parent list.
 * Returns null if the item is the first child.
 */
export function getPreviousSibling(
  state: EditorState,
  item: ListItemInfo
): ListItemInfo | null;

/**
 * Find the next sibling ListItem within the same parent list.
 * Returns null if the item is the last child.
 */
export function getNextSibling(
  state: EditorState,
  item: ListItemInfo
): ListItemInfo | null;

/**
 * Find the parent ListItem (one nesting level up).
 * Returns null if the item is at root level.
 */
export function getParentItem(
  state: EditorState,
  item: ListItemInfo
): ListItemInfo | null;

/**
 * Calculate the indentation string for a given depth level.
 * Reads the editor's indent unit (tab or spaces) from state.
 */
export function getIndentForDepth(
  state: EditorState,
  depth: number
): string;

/**
 * Re-indent a block of text to match a target depth.
 * Used when moving items between different nesting levels.
 * Adjusts all lines in the text relative to the new base depth.
 */
export function reindentText(
  state: EditorState,
  text: string,
  currentDepth: number,
  targetDepth: number
): string;

/**
 * Extract the block ID from a ListItem's text, if present.
 * Block IDs are in the format ^identifier at the end of the line.
 */
export function extractBlockId(
  state: EditorState,
  item: ListItemInfo
): string | null;

/**
 * Calculate the outliner range for zoom focus.
 * This REPLACES the foldable()-based approach in calculate-range.ts.
 * Returns the from/to range of the item and all its descendants.
 */
export function calculateOutlinerRange(
  state: EditorState,
  pos: number
): { from: number; to: number } | null;
```

##### Implementation notes

How to build `ListItemInfo` from a `SyntaxNode`:

```typescript
function buildListItemInfo(
  state: EditorState,
  node: SyntaxNode
): ListItemInfo {
  const doc = state.doc;

  // Find the ListMark child to get the marker text
  let marker = "-";
  let contentFrom = node.from;
  const listMark = node.getChild("ListMark");
  if (listMark) {
    marker = doc.sliceString(listMark.from, listMark.to);
    // Content starts after marker + space
    contentFrom = listMark.to + 1;
  }

  // Check for TaskMarker
  const taskMarker = node.getChild("TaskMarker");
  if (taskMarker) {
    contentFrom = taskMarker.to + 1;
  }

  // Determine if item has nested lists
  const nestedList =
    node.getChild("BulletList") || node.getChild("OrderedList");

  // Calculate depth by counting ListItem ancestors
  let depth = 0;
  let parent = node.parent;
  while (parent) {
    if (parent.name === "ListItem") depth++;
    parent = parent.parent;
  }

  // Find parent list container
  let parentList = node.parent;
  while (
    parentList &&
    parentList.name !== "BulletList" &&
    parentList.name !== "OrderedList"
  ) {
    parentList = parentList.parent;
  }

  // Get content text (first line only, before any children)
  const firstLineEnd = doc.lineAt(node.from).to;
  const contentEnd = nestedList
    ? Math.min(firstLineEnd, nestedList.from)
    : firstLineEnd;
  const contentText = doc.sliceString(contentFrom, contentEnd).trim();

  // Extract block ID if present
  const blockIdMatch = contentText.match(/\s\^([\w-]+)$/);
  const blockId = blockIdMatch ? blockIdMatch[1] : null;

  return {
    node,
    from: node.from,
    to: node.to,
    depth,
    parentList: parentList!,
    hasChildren: nestedList !== null,
    marker,
    isTask: taskMarker !== null,
    contentText,
    contentFrom,
    blockId,
  };
}
```

How to find siblings:

```typescript
function getPreviousSibling(
  state: EditorState,
  item: ListItemInfo
): ListItemInfo | null {
  // Walk backward through parent's children
  const parent = item.parentList;
  let prevSibling: SyntaxNode | null = null;
  let cursor = parent.firstChild;

  while (cursor) {
    if (cursor.name === "ListItem") {
      if (cursor.from === item.from) {
        // Found our item — prevSibling is the answer
        return prevSibling
          ? buildListItemInfo(state, prevSibling)
          : null;
      }
      prevSibling = cursor;
    }
    cursor = cursor.nextSibling;
  }
  return null;
}
```

##### Testing strategy

Create a test markdown document with these edge cases:

```markdown
- Root item 1
  - Child 1a
    - Grandchild 1a-i
  - Child 1b
- Root item 2
- Root item 3 ^existing-id

1. Ordered item A
2. Ordered item B
    1. Nested ordered

- [ ] Task item unchecked
- [x] Task item checked
  - [ ] Subtask

Paragraph between lists.

- Separate list after paragraph
  - With children
```

Verify that `resolveListItem` at each bullet returns correct
depth, marker, hasChildren, parentList, and blockId.

---

#### 3.2 Phase 1 — Migrate zoom to Lezer tree

**Goal**: Replace `foldable()` in `calculate-range.ts` with Lezer tree queries.
This validates the Lezer service on the simplest existing feature.

##### File to modify: `src/cm6/outliner/calculate-range.ts`

Before (current):

```typescript
import { foldable } from "@codemirror/language";

export function calculateOutlinerRange(
  state: EditorState,
  pos: number
): { from: number; to: number } | null {
  const line = state.doc.lineAt(pos);
  const foldRange = foldable(state, line.from, line.to);
  // ...
}
```

After (Lezer-based):

```typescript
import {
  calculateOutlinerRange as lezerCalculateRange,
} from "@/cm6/lezer-list-service";

export function calculateOutlinerRange(
  state: EditorState,
  pos: number
): { from: number; to: number } | null {
  return lezerCalculateRange(state, pos);
}
```

The implementation in `lezer-list-service.ts`:

```typescript
export function calculateOutlinerRange(
  state: EditorState,
  pos: number
): { from: number; to: number } | null {
  const tree = syntaxTree(state);
  let node = tree.resolve(pos, 1);

  // Walk up to find the nearest ListItem or heading
  while (node) {
    if (node.name === "ListItem") {
      return { from: node.from, to: node.to };
    }
    if (node.name === "ATXHeading1" ||
        node.name === "ATXHeading2" ||
        node.name === "ATXHeading3" ||
        node.name === "ATXHeading4" ||
        node.name === "ATXHeading5" ||
        node.name === "ATXHeading6" ||
        node.name === "SetextHeading1" ||
        node.name === "SetextHeading2") {
      // For headings, find the range until the next heading
      // of same or higher level
      return calculateHeadingRange(state, node);
    }
    node = node.parent;
  }

  // Fallback: try line-based approach for non-list content
  return null;
}
```

##### Validation

After this change, all existing zoom tests must pass:

- Cmd+. on a list item zooms to that item and its children
- Cmd+. on a heading zooms to that heading's section
- Focused zoom state remains navigable without covering editor content
- Click-on-bullet zoom still works
- Boundary violation detection still triggers unfocus

---

#### 3.3 Phase 2 — Keyboard operations

**Goal**: Implement move, indent/outdent, smart Enter/Tab, cursor stick, smart select.

##### File: `src/cm6/outliner/keyboard-ops.ts`

All operations are CM6 `StateCommand` functions that read the Lezer tree
and dispatch transactions.

```typescript
// src/cm6/outliner/keyboard-ops.ts

import type { StateCommand } from "@codemirror/state";

/** Move current list item + children up one sibling position */
export const moveListItemUp: StateCommand;

/** Move current list item + children down one sibling position */
export const moveListItemDown: StateCommand;

/** Indent: make current item a child of previous sibling */
export const indentListItem: StateCommand;

/** Outdent: move current item up one nesting level */
export const outdentListItem: StateCommand;

/**
 * Smart Enter:
 * - Non-empty item: create new sibling below
 * - Empty item at depth > 0: outdent
 * - Empty item at depth 0: exit list mode
 */
export const smartEnter: StateCommand;

/**
 * Smart Tab:
 * - In list context: indent
 * - Shift+Tab in list context: outdent
 * Note: These are registered via keymap, not overriding default Tab
 */
export const smartTab: StateCommand;
export const smartShiftTab: StateCommand;

/**
 * Smart Select (Cmd/Ctrl+A):
 * - If selection is collapsed and cursor is in list: select current item
 * - If current item is selected: select entire list
 * - Otherwise: fall through to default select-all
 */
export const smartSelectAll: StateCommand;

/**
 * Cursor stick:
 * - Prevents cursor from entering the bullet marker area
 * - Home key goes to start of content, not start of line
 */
export const cursorStickLeft: StateCommand;
export const cursorStickHome: StateCommand;
```

##### Implementation pattern for `moveListItemUp`

```typescript
export const moveListItemUp: StateCommand = ({ state, dispatch }) => {
  const cursor = state.selection.main.head;
  const item = resolveListItem(state, cursor);
  if (!item) return false;

  const prev = getPreviousSibling(state, item);
  if (!prev) return false;

  const subtree = getSubtreeRange(state, item);
  const prevRange = getSubtreeRange(state, prev);

  // Build the transaction: remove current, insert before previous
  // We need to handle this carefully to avoid offset shifts
  const cursorOffsetInItem = cursor - subtree.from;

  dispatch(
    state.update({
      changes: [
        // Delete current item
        { from: subtree.from, to: subtree.to, insert: "" },
        // Insert before previous sibling
        { from: prevRange.from, insert: subtree.text },
      ],
      selection: {
        anchor: prevRange.from + cursorOffsetInItem,
      },
      userEvent: "input.move",
    })
  );
  return true;
};
```

##### Feature classes

Each keyboard capability gets its own FeatureToggle:

```text
src/capabilities/features/outliner/
├── index.ts                         (modify: register new features)
├── outliner-enabled.ts              (existing)
├── outliner-on-click.ts             (existing)
├── outliner-keyboard-ops.ts         (NEW)
├── outliner-cursor-stick.ts         (NEW)
├── outliner-smart-enter.ts          (NEW)
├── outliner-smart-tab.ts            (NEW)
├── outliner-smart-select.ts         (NEW)
└── outliner-sidebar.ts              (NEW)
```

Each follows the existing pattern:

```typescript
// src/capabilities/features/outliner/outliner-keyboard-ops.ts

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class OutlinerKeyboardOps extends FeatureToggle {
  readonly settingKey = "outliner.isKeyboardOpsEnabled" as const;
  protected settingTitle = "List keyboard operations";
  protected settingDesc =
    "Move list items up/down with Ctrl/Cmd+Shift+Arrow keys. " +
    "Preserves children and indentation.";

  override enable() {
    super.enable();
    this.tm.reconfigureOutliner();
  }

  override disable() {
    super.disable();
    this.tm.reconfigureOutliner();
  }
}
```

##### Command classes

```typescript
// src/capabilities/commands/move-list-up.ts

import type { EditorView } from "@codemirror/view";
import type { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { EditorCommand } from "../base/editor-command";

export class MoveListUp extends EditorCommand {
  readonly commandKey = "move-list-up";
  readonly commandTitle = "Outliner: Move list item up";

  protected override registerCommand() {
    this.tm.plugin.addCommand({
      id: this.commandKey,
      name: this.commandTitle,
      icon: "arrow-up",
      editorCallback: this.onCommand.bind(this),
      hotkeys: [
        { modifiers: ["Mod", "Shift"], key: "ArrowUp" },
      ],
    });
  }

  protected onCommand(
    editor: Editor,
    _view: MarkdownView | MarkdownFileInfo,
  ) {
    const cm = (editor as unknown as { cm: EditorView }).cm;
    // The StateCommand handles all logic
    moveListItemUp({ state: cm.state, dispatch: cm.dispatch });
  }
}
```

##### CM6 extension registration

In `src/cm6/outliner/index.ts`, add a new Compartment:

```typescript
const outlinerKeyboardCmpt = new Compartment();

function buildKeyboardExtension(enabled: boolean): Extension {
  if (!enabled) return [];
  return keymap.of([
    { key: "Mod-Shift-ArrowUp", run: moveListItemUp },
    { key: "Mod-Shift-ArrowDown", run: moveListItemDown },
    // Smart Enter/Tab are registered conditionally
  ]);
}
```

Smart Enter and Tab need special handling because they must only trigger
inside list context and fall through to Obsidian defaults otherwise:

```typescript
function buildSmartEnterExtension(enabled: boolean): Extension {
  if (!enabled) return [];
  return keymap.of([
    {
      key: "Enter",
      run: (view) => {
        // Only handle if cursor is in a list item
        const item = resolveListItem(view.state, view.state.selection.main.head);
        if (!item) return false; // Fall through to default
        return smartEnter({ state: view.state, dispatch: view.dispatch });
      },
    },
  ]);
}
```

---

---

#### 3.5 Phase 4 — Sidebar outline (Quiet Outline replacement)

**Goal**: Register an Obsidian `ItemView` that shows heading + list hierarchy.

##### File: `src/components/outline-view.ts`

```typescript
import { ItemView, type WorkspaceLeaf } from "obsidian";
import { syntaxTree } from "@codemirror/language";
import type { EditorView } from "@codemirror/view";
import type TypewriterModeLib from "@/lib";

export const OUTLINE_VIEW_TYPE = "md-writer-outline";

export class OutlineView extends ItemView {
  private tm: TypewriterModeLib;
  private updateTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(leaf: WorkspaceLeaf, tm: TypewriterModeLib) {
    super(leaf);
    this.tm = tm;
  }

  getViewType(): string {
    return OUTLINE_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Outline";
  }

  getIcon(): string {
    return "list-tree";
  }

  async onOpen() {
    this.buildOutline();
    // Listen for active file changes
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.scheduleUpdate();
      })
    );
    // Listen for document changes via metadata cache
    this.registerEvent(
      this.app.metadataCache.on("changed", () => {
        this.scheduleUpdate();
      })
    );
  }

  private scheduleUpdate() {
    if (this.updateTimeout) clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => this.buildOutline(), 200);
  }

  private buildOutline() {
    const container = this.contentEl;
    container.empty();

    // Get the active editor view
    const activeView = this.app.workspace.getActiveViewOfType(
      /* MarkdownView */ null as any
    );
    // Use Lezer tree to build hierarchy
    // ... implementation reads tree and builds DOM
  }
}
```

##### Registration in `lib.ts`

```typescript
// In TypewriterModeLib constructor or load()
this.plugin.registerView(
  OUTLINE_VIEW_TYPE,
  (leaf) => new OutlineView(leaf, this)
);

// Add ribbon icon to open the view
this.plugin.addRibbonIcon("list-tree", "Open outline", () => {
  this.plugin.app.workspace.getRightLeaf(false)?.setViewState({
    type: OUTLINE_VIEW_TYPE,
  });
});
```

---

#### 3.6 Phase 5 — Block ID and block linking

**Goal**: Auto-generate invisible block IDs, provide copy commands.

##### File: `src/cm6/outliner/block-id.ts`

Two responsibilities:

1. Hide `^block-id` text in Live Preview via `Decoration.replace()`
2. Generate new IDs when requested

```typescript
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";

const blockIdRegex = / \^[\w-]+$/;

// ViewPlugin that hides block IDs in Live Preview
export const blockIdHiderPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.build(update.view);
      }
    }

    build(view: EditorView): DecorationSet {
      const builder: ReturnType<typeof Decoration.replace>[] = [];
      const doc = view.state.doc;

      for (const { from, to } of view.visibleRanges) {
        let pos = from;
        while (pos <= to) {
          const line = doc.lineAt(pos);
          const match = line.text.match(blockIdRegex);
          if (match) {
            const idStart = line.from + match.index!;
            builder.push(
              Decoration.replace({}).range(idStart, line.to)
            );
          }
          pos = line.to + 1;
        }
      }

      return Decoration.set(builder, true);
    }
  },
  { decorations: (v) => v.decorations }
);

/** Generate a new block ID string */
export function generateBlockId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "ol-";
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/** Insert a block ID on the current line if none exists */
export function insertBlockId(
  view: EditorView
): string {
  const pos = view.state.selection.main.head;
  const line = view.state.doc.lineAt(pos);

  // Check if line already has a block ID
  const existing = line.text.match(blockIdRegex);
  if (existing) {
    return existing[0].trim().slice(1); // Return existing ID without ^
  }

  const newId = generateBlockId();
  view.dispatch({
    changes: {
      from: line.to,
      insert: ` ^${newId}`,
    },
  });
  return newId;
}
```

##### Commands

```typescript
// src/capabilities/commands/copy-block-link.ts

import type { EditorView } from "@codemirror/view";
import type { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { Notice } from "obsidian";
import { EditorCommand } from "../base/editor-command";
import { insertBlockId } from "@/cm6/outliner/block-id";

export class CopyBlockLink extends EditorCommand {
  readonly commandKey = "copy-block-link";
  readonly commandTitle = "Outliner: Copy block link";

  protected override registerCommand() {
    this.tm.plugin.addCommand({
      id: this.commandKey,
      name: this.commandTitle,
      icon: "link",
      editorCallback: this.onCommand.bind(this),
    });
  }

  protected onCommand(
    editor: Editor,
    _view: MarkdownView | MarkdownFileInfo,
  ) {
    const cm = (editor as unknown as { cm: EditorView }).cm;
    const blockId = insertBlockId(cm);
    const file = this.tm.plugin.app.workspace.getActiveFile();
    if (!file) return;

    const link = `[[${file.basename}^${blockId}]]`;
    navigator.clipboard.writeText(link);
    new Notice(`Copied: ${link}`);
  }
}

// src/capabilities/commands/copy-block-embed.ts
// Same pattern, but generates ![[filename^block-id]]
```

---

#### 3.7 Phase 6 — Fold state persistence

**Goal**: Serialize fold state keyed by block ID, restore on file open.

##### File: `src/cm6/outliner/fold-persist.ts`

This is the trickiest module because CM6 does not emit a clean "fold changed" event.
The approach: use a `TransactionExtender` to detect fold-related transactions.

```typescript
import {
  type Extension,
  StateEffect,
  type Transaction,
} from "@codemirror/state";
import { EditorView, foldEffect, unfoldEffect } from "@codemirror/view";
import type TypewriterModeLib from "@/lib";
import { resolveListItem, extractBlockId } from "./lezer-list-service";
import { insertBlockId } from "./block-id";

/**
 * Detect fold/unfold transactions and persist them.
 * CM6 uses foldEffect and unfoldEffect from @codemirror/view.
 * We intercept these via a TransactionExtender.
 */
export function createFoldPersistExtension(
  tm: TypewriterModeLib
): Extension {
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  return EditorView.updateListener.of((update) => {
    if (!update.transactions.length) return;

    let foldChanged = false;
    for (const tr of update.transactions) {
      for (const effect of tr.effects) {
        if (effect.is(foldEffect) || effect.is(unfoldEffect)) {
          foldChanged = true;

          // Determine which list item was folded/unfolded
          const pos = effect.is(foldEffect)
            ? effect.value.from
            : effect.value.from;
          const item = resolveListItem(update.state, pos);
          if (!item) continue;

          // Ensure the item has a block ID
          let blockId = item.blockId;
          if (!blockId && effect.is(foldEffect)) {
            // Auto-generate block ID for folded items
            blockId = insertBlockId(update.view);
          }

          if (blockId) {
            const filePath =
              tm.plugin.app.workspace.getActiveFile()?.path;
            if (!filePath) continue;

            // Update fold state in memory
            if (!tm.settings.foldState) {
              tm.settings.foldState = {};
            }
            if (!tm.settings.foldState[filePath]) {
              tm.settings.foldState[filePath] = {};
            }
            tm.settings.foldState[filePath][blockId] =
              effect.is(foldEffect);
          }
        }
      }
    }

    if (foldChanged) {
      // Debounced save
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        tm.saveSettings();
      }, 1000);
    }
  });
}

/**
 * Restore fold state when a file is opened.
 * Called from the main plugin lifecycle.
 */
export function restoreFoldState(
  view: EditorView,
  tm: TypewriterModeLib
): void {
  const filePath = tm.plugin.app.workspace.getActiveFile()?.path;
  if (!filePath) return;

  const foldStates = tm.settings.foldState?.[filePath];
  if (!foldStates) return;

  // Find all list items with matching block IDs and fold them
  const items = getAllListItems(view.state);
  const effects: StateEffect<unknown>[] = [];

  for (const item of items) {
    if (item.blockId && foldStates[item.blockId]) {
      // This item should be folded
      effects.push(
        foldEffect.of({
          from: item.from,
          to: item.to,
        })
      );
    }
  }

  if (effects.length > 0) {
    view.dispatch({ effects });
  }
}
```

##### Warning: `foldEffect` and `unfoldEffect`

These effects are internal to CM6's fold system.
They may not be directly exported from `@codemirror/view` in all versions.
If not available, the alternative approach is:

1. Use `EditorView.updateListener` to detect when the fold state field changes
2. Compare fold ranges before and after each transaction
3. Map changed ranges to ListItem positions via the Lezer tree

This is the highest-risk component in the implementation.
If `foldEffect`/`unfoldEffect` are not accessible,
the fallback is to poll fold state on a timer (less elegant but functional).

---

#### 3.8 Phase 7 — Settings migration and integration

**Goal**: Wire everything together in `settings.ts`, `lib.ts`, and `settings-tab.ts`.

##### `settings.ts` changes

1. Add `BlockIdSettings` and `FoldPersistSettings` interfaces
2. Extend `OutlinerSettings` with new fields
3. Add `foldState` to `TypewriterModeSettings`
4. Extend `DEFAULT_SETTINGS` with new defaults
5. Add migration in `applyStartupMigrations()`:

```typescript
// In the deep-merge section of applyStartupMigrations():

// Migrate: add new outliner fields if upgrading from pre-outliner version
if (settings.outliner && !("isKeyboardOpsEnabled" in settings.outliner)) {
  settings.outliner = {
    ...DEFAULT_SETTINGS.outliner,
    ...settings.outliner,
  };
}

// Add new settings groups if not present
if (!("blockId" in settings)) {
  (settings as Record<string, unknown>).blockId =
    { ...DEFAULT_SETTINGS.blockId };
}
if (!("foldPersist" in settings)) {
  (settings as Record<string, unknown>).foldPersist =
    { ...DEFAULT_SETTINGS.foldPersist };
}
```

##### `lib.ts` changes

1. Import new CM6 extensions
2. Add them to `editorExtensions[]` array with Compartments
3. Register the outline sidebar view
4. Add `reconfigureOutliner()` updates for new Compartments
5. Hook fold restore into `file-open` event

##### `settings-tab.ts` changes

Add new tabs or extend the existing "Outliner" tab with sub-sections:

- Outliner tab gets sections: Zoom, Keyboard, Drag & Drop
- New "Block ID" tab
- New "Fold Persistence" tab (or merge into Outliner)

##### `features/index.ts` changes

```typescript
export function getFeatures(tm: TypewriterModeLib) {
  return {
    // ... existing ...
    outliner: outliner(tm),       // now includes new features
    blockId: blockId(tm),         // NEW
    foldPersist: foldPersist(tm), // NEW
  };
}
```

##### `commands/index.ts` changes

```typescript
export function getCommands(tm: TypewriterModeLib) {
  return Object.fromEntries([
    // ... existing ...
    new MoveListUp(tm),
    new MoveListDown(tm),
    new CopyBlockLink(tm),
    new CopyBlockEmbed(tm),
    new GenerateBlockId(tm),
  ].map((cmd) => [cmd.commandKey, cmd]));
}
```

---

#### 3.9 File manifest

Complete list of files to create and modify.

##### New files (create)

| File | Phase | Purpose |
| --- | --- | --- |
| `src/cm6/lezer-list-service.ts` | 0 | Shared Lezer tree query functions |
| `src/cm6/outliner/keyboard-ops.ts` | 2 | StateCommand functions for list ops |
| `src/cm6/outliner/block-id.ts` | 5 | Block ID generation + hiding |
| `src/cm6/outliner/fold-persist.ts` | 6 | Fold state serialization |
| `src/components/outline-view.ts` | 4 | Sidebar outline panel |
| `src/capabilities/features/outliner/outliner-keyboard-ops.ts` | 2 | FeatureToggle |
| `src/capabilities/features/outliner/outliner-cursor-stick.ts` | 2 | FeatureToggle |
| `src/capabilities/features/outliner/outliner-smart-enter.ts` | 2 | FeatureToggle |
| `src/capabilities/features/outliner/outliner-smart-tab.ts` | 2 | FeatureToggle |
| `src/capabilities/features/outliner/outliner-smart-select.ts` | 2 | FeatureToggle |
| `src/capabilities/features/outliner/outliner-sidebar.ts` | 4 | FeatureToggle |
| `src/capabilities/features/block-id/index.ts` | 5 | Feature category |
| `src/capabilities/features/block-id/block-id-enabled.ts` | 5 | FeatureToggle |
| `src/capabilities/features/block-id/block-id-auto-generate.ts` | 5 | FeatureToggle |
| `src/capabilities/features/block-id/block-id-hide.ts` | 5 | FeatureToggle |
| `src/capabilities/features/fold-persist/index.ts` | 6 | Feature category |
| `src/capabilities/features/fold-persist/fold-persist-enabled.ts` | 6 | FeatureToggle |
| `src/capabilities/commands/move-list-up.ts` | 2 | EditorCommand |
| `src/capabilities/commands/move-list-down.ts` | 2 | EditorCommand |
| `src/capabilities/commands/copy-block-link.ts` | 5 | EditorCommand |
| `src/capabilities/commands/copy-block-embed.ts` | 5 | EditorCommand |
| `src/capabilities/commands/generate-block-id.ts` | 5 | EditorCommand |

##### Modified files

| File | Phase | Changes |
| --- | --- | --- |
| `src/cm6/outliner/calculate-range.ts` | 1 | Replace `foldable()` with Lezer service |
| `src/cm6/outliner/index.ts` | 2 | Add keyboard-related compartments |
| `src/capabilities/features/outliner/index.ts` | 2, 4 | Register new features |
| `src/capabilities/features/index.ts` | 5, 6 | Add blockId + foldPersist categories |
| `src/capabilities/commands/index.ts` | 2, 5 | Register new commands |
| `src/capabilities/settings.ts` | 7 | Extend interfaces, defaults, migration |
| `src/lib.ts` | 7 | Register extensions, sidebar, fold restore |
| `src/components/settings-tab.ts` | 7 | Add/extend settings tabs |
| `src/styles/editor/_index.scss` | 3 | Ensure outliner styles included |

---

#### 3.10 Implementation order

Strict dependency order — each phase depends on the previous:

```text
Phase 0: lezer-list-service.ts
    │
    ▼
Phase 1: migrate calculate-range.ts (validate Lezer service)
    │
    ▼
Phase 2: keyboard-ops.ts + feature classes + commands
    │
    ▼
Phase 3: outline-view.ts (depends on lezer-list-service)
    │
    ▼
Phase 4: block-id.ts + commands (independent, but needed by Phase 5)
    │
    ▼
Phase 5: fold-persist.ts (depends on block-id)
    │
    ▼
Phase 6: settings migration + wiring (integrates everything)
```

Each phase should be a separate PR with its own validation:

- Phase 0: Unit test the service functions against test markdown
- Phase 1: Verify zoom still works identically
- Phase 2: Verify move/indent/Enter/Tab work in both modes
- Phase 3: Verify sidebar shows correct hierarchy
- Phase 4: Verify block ID generation and copy commands
- Phase 5: Verify fold state persists across file close/open
- Phase 6: Verify settings migration for existing users

---

#### 3.11 Risk register

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Lezer tree may not be fully parsed for long documents (lazy parsing) | High | Use `syntaxTree(state)` which triggers synchronous parse; for very large docs, use `ensureSyntaxTree(state, timeout)` |
| `foldEffect`/`unfoldEffect` may not be exported by Obsidian's CM6 bundle | High | Fallback: detect fold changes by comparing fold state field before/after transactions |
| Ordered lists need renumbering after move | Medium | After move transaction, scan the affected list and dispatch a second transaction to fix numbers |
| Block ID collisions across files | Low | 5-char alphanumeric gives 60M combinations; collision probability is negligible for typical vaults |
| Settings migration breaks for users with custom `data.json` edits | Low | Deep-merge with defaults; never overwrite existing values |

---

#### 3.12 Glossary

| Term | Definition |
| --- | --- |
| Lezer tree | The syntax tree produced by CM6's parser; accessed via `syntaxTree(state)` |
| ListItem | A Lezer node representing one item in a list (including its children) |
| BulletList | A Lezer node representing a container of `-` items |
| StateField | CM6 mechanism for storing state that persists across transactions |
| StateEffect | CM6 mechanism for signaling state changes within a transaction |
| ViewPlugin | CM6 mechanism for attaching behavior to the editor view (DOM events, decorations) |
| Decoration | CM6 mechanism for adding visual elements to the editor without modifying the document |
| Compartment | CM6 mechanism for runtime reconfiguration of extensions |
| StateCommand | A function `({state, dispatch}) => boolean` used for keyboard-bound operations |
| `foldable()` | A CM6 function that determines if a line can be folded; being replaced by Lezer queries |
| Block ID | An Obsidian-native `^identifier` suffix that makes a block addressable for linking |
| `data.json` | Obsidian's per-plugin storage file where settings and state are persisted |
