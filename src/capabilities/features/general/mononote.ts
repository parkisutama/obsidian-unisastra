// Keep-one-tab-per-note, adapted for MD Writer from MonoNote by Carlo
// Zottmann (MIT).
// https://github.com/czottmann/obsidian-mononote, src/main.ts
// (onActiveLeafChange, processActiveLeaf, duplicateLeaves sort/filter,
// FOCUS_DELAY_MS).
// Revision 0e3ebc79f7a9c9ba70c07c22444c5bb70a73956e.
// Copyright (c) 2023-present Carlo Zottmann. Full notice:
// licenses/mononote-MIT.txt.
//
// Differences from upstream, deliberate:
// - Tracks in-flight leaves with a `Set<string>` instead of upstream's
//   `Map<string, Promise<void>>`, since only membership is needed here.
// - Drops upstream's console logging.
// - Uses this codebase's FeatureToggle lifecycle (enable/disable) instead
//   of registering directly in a plugin's onload/onunload.

import type { WorkspaceLeaf } from "obsidian";
import { FeatureToggle } from "@/capabilities/base/feature-toggle";

type ObsidianEventHandler = (...data: unknown[]) => unknown;

const FOCUS_DELAY_MS = 100;

// `id`, `activeTime`, `pinned`, and `history` are internal WorkspaceLeaf
// fields with no public typings, mirroring the upstream plugin's own
// `RealLifeWorkspaceLeaf` cast.
interface InternalLeafFields {
  activeTime: number;
  history: { back(): void; backHistory: unknown[] };
  id: string;
  pinned?: boolean;
}

type InternalLeaf = WorkspaceLeaf & InternalLeafFields;

export default class Mononote extends FeatureToggle {
  readonly settingKey = "general.isMononoteEnabled" as const;
  protected settingTitle = "Keep one tab per note";
  protected settingDesc =
    "Focus a note's existing tab instead of opening a duplicate when it's already open elsewhere in the same tab group.";

  private readonly processingLeafIds = new Set<string>();

  override enable(): void {
    super.enable();

    this.tm.plugin.registerEvent(
      this.tm.plugin.app.workspace.on(
        "active-leaf-change",
        this.onActiveLeafChange
      )
    );
  }

  override disable(): void {
    super.disable();
    this.tm.plugin.app.workspace.off(
      "active-leaf-change",
      this.onActiveLeafChange as ObsidianEventHandler
    );
    this.processingLeafIds.clear();
  }

  private readonly onActiveLeafChange = (
    activeLeaf: WorkspaceLeaf | null
  ): void => {
    if (!activeLeaf) {
      return;
    }

    const leaf = activeLeaf as InternalLeaf;
    if (this.processingLeafIds.has(leaf.id)) {
      return;
    }

    this.processingLeafIds.add(leaf.id);
    this.processActiveLeaf(leaf)
      .catch((error: unknown) => {
        console.error("Mononote failed to process active leaf:", error);
      })
      .finally(() => {
        this.processingLeafIds.delete(leaf.id);
      });
  };

  private processActiveLeaf(activeLeaf: InternalLeaf): Promise<void> {
    const filePath = activeLeaf.view.getState().file as string | undefined;
    if (!filePath) {
      return Promise.resolve();
    }

    const { workspace } = this.tm.plugin.app;
    const viewType = activeLeaf.view.getViewType();

    // Leaves of the same type, in the same tab group, showing the same file
    // as the active leaf, most-recently-active first (never-active leaves last).
    const duplicateLeaves = (
      workspace.getLeavesOfType(viewType) as InternalLeaf[]
    )
      .filter(
        (leaf) =>
          leaf.parent === activeLeaf.parent &&
          leaf.id !== activeLeaf.id &&
          leaf.view.getState().file === filePath
      )
      .sort((a, b) => {
        if (a.activeTime === 0) {
          return -1;
        }
        if (b.activeTime === 0) {
          return 1;
        }
        return b.activeTime - a.activeTime;
      });

    if (duplicateLeaves.length === 0) {
      return Promise.resolve();
    }

    const targetToFocus = (duplicateLeaves.find((leaf) => leaf.pinned) ??
      duplicateLeaves.find((leaf) => !leaf.pinned)) as InternalLeaf;

    return new Promise((resolve) => {
      // Deferred so Obsidian has time to update the leaf's navigation
      // history before the "has history?" check below runs.
      window.setTimeout(() => {
        const ephemeralState = { ...activeLeaf.getEphemeralState() };
        const hasEphemeralState = Object.keys(ephemeralState).length > 0;

        if (
          activeLeaf.view.navigation &&
          activeLeaf.history.backHistory.length > 0
        ) {
          // Triggers another active-leaf-change event, ignored because this
          // leaf id is already in processingLeafIds.
          activeLeaf.history.back();
        } else if (activeLeaf.pinned) {
          resolve();
          return;
        } else {
          activeLeaf.detach();
        }

        window.setTimeout(() => {
          workspace.setActiveLeaf(targetToFocus, { focus: true });
          if (hasEphemeralState) {
            targetToFocus.setEphemeralState(ephemeralState);
          }
          resolve();
        }, FOCUS_DELAY_MS);
      }, FOCUS_DELAY_MS);
    });
  }
}
