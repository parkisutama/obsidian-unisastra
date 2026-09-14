// Writing focus, adapted for MD Writer from Obsidian Focus Mode by
// ryanpcmcquen, licensed under the Mozilla Public License 2.0.
// https://github.com/ryanpcmcquen/obsidian-focus-mode, main.ts
// (FocusMode: storeSplitsValues, collapseSplits, restoreSplits,
// removeExtraneousClasses, enableFocusMode, disableFocusMode,
// toggleFocusMode).
// Revision cd68eda3c035e0340ff7da730e1f2a5acd3465e4.
// Copyright (c) 2024-2026 ryanpcmcquen. Full notice:
// licenses/writing-focus-MPL2.0.txt.
//
// Differences from upstream, deliberate:
// - Drops "Super Focus Mode" (hide-all-but-active-pane) entirely; only the
//   single collapse-splits focus mode is kept.
// - Renamed properties to match this codebase's style (maximisedClass ->
//   maximizedClass, etc.) and replaced direct `document` access with
//   `window.activeDocument` for popout-window correctness.
// - Adds optional native Electron fullscreen (startFullscreen/
//   exitFullscreen), which upstream does not have.
// - Uses `this.tm.plugin.app.workspace` (this codebase's DI pattern)
//   instead of upstream's direct, type-suppressed `this.app` access.

import { ItemView, Platform } from "obsidian";
import type TypewriterModeLib from "@/lib";

export class WritingFocus {
  private readonly tm: TypewriterModeLib;

  constructor(tm: TypewriterModeLib) {
    this.tm = tm;
  }

  private focusModeActive = false;

  private readonly maximizedClass = "ptm-maximized";
  private readonly focusModeClass = "ptm-focus-mode";
  private readonly hiddenWorkspaceSplitClass = "ptm-writing-focus-hidden-split";

  private leftSplitCollapsed = false;
  private rightSplitCollapsed = false;

  private prevWasFullscreen = false;

  private getActiveDocument(): Document {
    return window.activeDocument;
  }

  private startFullscreen() {
    // Native electron fullscreen is not supported on mobile
    if (Platform.isMobile) {
      return;
    }

    const currentWindow = window.electron.remote.getCurrentWindow();
    this.prevWasFullscreen = currentWindow.isFullScreen();
    currentWindow.setFullScreen(true);

    const onLeaveFullScreen = () => {
      this.onExitFullscreenWritingFocus();
      currentWindow.off("leave-full-screen", onLeaveFullScreen);
    };

    currentWindow.on("leave-full-screen", onLeaveFullScreen);
  }

  private exitFullscreen() {
    // Native electron fullscreen is not supported on mobile
    if (Platform.isMobile) {
      return;
    }

    // Do not exit fullscreen if writing focus was started in fullscreen
    if (this.prevWasFullscreen) {
      return;
    }

    const currentWindow = window.electron.remote.getCurrentWindow();
    currentWindow.setFullScreen(false);
  }

  private onExitFullscreenWritingFocus() {
    if (this.focusModeActive) {
      this.disableFocusModeForView();
    }
  }

  private storeSplitsValues() {
    this.leftSplitCollapsed = this.tm.plugin.app.workspace.leftSplit.collapsed;
    this.rightSplitCollapsed =
      this.tm.plugin.app.workspace.rightSplit.collapsed;
  }

  private collapseSplits() {
    this.tm.plugin.app.workspace.leftSplit.collapse();
    this.tm.plugin.app.workspace.rightSplit.collapse();
  }

  private restoreSplits() {
    if (!this.leftSplitCollapsed) {
      this.tm.plugin.app.workspace.leftSplit.expand();
    }
    if (!this.rightSplitCollapsed) {
      this.tm.plugin.app.workspace.rightSplit.expand();
    }
  }

  private removeExtraneousClasses() {
    const activeDocument = this.getActiveDocument();

    if (
      this.tm.plugin.app.workspace.containerEl.hasClass(this.maximizedClass)
    ) {
      this.tm.plugin.app.workspace.containerEl.removeClass(this.maximizedClass);
    }
    if (activeDocument.body.classList.contains(this.focusModeClass)) {
      activeDocument.body.classList.remove(this.focusModeClass);
    }
    this.resetWorkspaceSplitVisibility();
  }

  private updateWorkspaceSplitVisibility() {
    const activeDocument = this.getActiveDocument();

    Array.from(
      activeDocument.querySelectorAll(
        `.${this.focusModeClass} .workspace-split`
      )
    ).forEach((node) => {
      const workspaceSplit = node as HTMLElement;
      const hasActiveKids = workspaceSplit.querySelector(".mod-active");
      workspaceSplit.classList.toggle(
        this.hiddenWorkspaceSplitClass,
        !hasActiveKids
      );
    });
  }

  private resetWorkspaceSplitVisibility() {
    const activeDocument = this.getActiveDocument();

    Array.from(activeDocument.querySelectorAll(".workspace-split")).forEach(
      (node) => {
        node.classList.remove(this.hiddenWorkspaceSplitClass);
      }
    );
  }

  private enableFocusModeForView() {
    this.focusModeActive = true;
    const activeDocument = this.getActiveDocument();

    if (!activeDocument.body.classList.contains(this.focusModeClass)) {
      this.storeSplitsValues();
    }

    this.collapseSplits();

    this.tm.plugin.app.workspace.containerEl.toggleClass(
      this.maximizedClass,
      !this.tm.plugin.app.workspace.containerEl.hasClass(this.maximizedClass)
    );

    activeDocument.body.classList.toggle(
      this.focusModeClass,
      !activeDocument.body.classList.contains(this.focusModeClass)
    );

    if (activeDocument.body.classList.contains(this.focusModeClass)) {
      this.updateWorkspaceSplitVisibility();
    }

    if (this.tm.settings.writingFocus.isWritingFocusFullscreen) {
      this.startFullscreen();
    }
  }

  private disableFocusModeForView() {
    const activeDocument = this.getActiveDocument();

    this.removeExtraneousClasses();

    if (activeDocument.body.classList.contains(this.focusModeClass)) {
      activeDocument.body.classList.remove(this.focusModeClass);
    }

    this.restoreSplits();
    this.resetWorkspaceSplitVisibility();

    if (this.tm.settings.writingFocus.isWritingFocusFullscreen) {
      this.exitFullscreen();
    }

    this.focusModeActive = false;
  }

  enableFocusMode() {
    const view = this.tm.plugin.app.workspace.getActiveViewOfType(ItemView);
    if (!view || view?.getViewType() === "empty") {
      return;
    }
    this.enableFocusModeForView();
  }

  disableFocusMode() {
    const view = this.tm.plugin.app.workspace.getActiveViewOfType(ItemView);
    if (!view || view?.getViewType() === "empty") {
      return;
    }
    this.disableFocusModeForView();
  }

  toggleFocusMode() {
    this.focusModeActive ? this.disableFocusMode() : this.enableFocusMode();
  }
}
