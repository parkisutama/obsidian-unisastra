// Typewriter scrolling concept inspired by deathau's
// cm-typewriter-scroll-obsidian
// (https://github.com/deathau/cm-typewriter-scroll-obsidian). No code
// ported; this scroll-offset math (caret coordinates, keep-lines bounds)
// is an original CM6 implementation, not a port of upstream's CM5-era
// extension.

import type { EditorView, Rect } from "@codemirror/view";
import type UnisastraCore from "@/lib";
import { getEditorDom, getScrollDom } from "./selectors";

interface TypewriterScrollOffsetInput {
  activeLineOffset: number;
  isOnlyMaintainTypewriterOffsetWhenReachedEnabled: boolean;
  scrollTop: number;
  typewriterOffset: number;
}

interface KeepLinesScrollOffsetInput {
  activeLineOffset: number;
  editorHeight: number;
  lineHeight: number;
  linesAboveAndBelow: number;
  scrollTop: number;
}

export function calculateTypewriterScrollOffset({
  activeLineOffset,
  typewriterOffset,
  scrollTop,
  isOnlyMaintainTypewriterOffsetWhenReachedEnabled,
}: TypewriterScrollOffsetInput): number {
  if (!isOnlyMaintainTypewriterOffsetWhenReachedEnabled) {
    return typewriterOffset;
  }
  if (activeLineOffset < 0) {
    return 0;
  }
  return scrollTop + activeLineOffset < typewriterOffset
    ? Math.min(typewriterOffset, activeLineOffset)
    : typewriterOffset;
}

export function calculateKeepLinesScrollOffset({
  activeLineOffset,
  editorHeight,
  lineHeight,
  linesAboveAndBelow,
  scrollTop,
}: KeepLinesScrollOffsetInput): number {
  const lowerBound = lineHeight * linesAboveAndBelow;
  const upperBound = editorHeight - lineHeight * (linesAboveAndBelow + 1);
  const belowLowerBound = scrollTop !== 0 && activeLineOffset < lowerBound;
  const aboveUpperBound = activeLineOffset > upperBound;
  if (belowLowerBound) {
    return lowerBound;
  }
  if (aboveUpperBound) {
    return upperBound;
  }
  return activeLineOffset;
}

export class TypewriterOffsetCalculator {
  protected tm: UnisastraCore;
  protected view: EditorView;

  constructor(tm: UnisastraCore, view: EditorView) {
    this.tm = tm;
    this.view = view;
  }

  getActiveLineProp(prop: string) {
    const valueStr = this.view.contentDOM
      .querySelector(".cm-active.cm-line")
      ?.getCssPropertyValue(prop)
      .replace("px", "");
    if (!valueStr) {
      return null;
    }
    return Number.parseFloat(valueStr);
  }

  getActiveLineOffset(caretCoords: Rect) {
    const caretOffset = caretCoords.top;

    const editorDom = getEditorDom(this.view);
    if (!editorDom) {
      return 0;
    }

    const containerOffset = editorDom.getBoundingClientRect().top;
    return caretOffset - containerOffset;
  }

  getTypewriterOffset() {
    const editorDom = getEditorDom(this.view);
    if (!editorDom) {
      return 0;
    }

    return (
      editorDom.clientHeight * this.tm.settings.typewriter.typewriterOffset
    );
  }

  private calculateScrollOffset(
    activeLineOffset: number,
    typewriterOffset: number,
    editorDom: HTMLElement,
    scrollDom: HTMLElement
  ): number {
    const isTypewriterScrollEnabled =
      this.tm.settings.typewriter.isTypewriterScrollEnabled;
    const isKeepLinesAboveAndBelowEnabled =
      this.tm.settings.keepLinesAboveAndBelow.isKeepLinesAboveAndBelowEnabled;
    const isOnlyMaintainTypewriterOffsetWhenReachedEnabled =
      this.tm.settings.typewriter
        .isOnlyMaintainTypewriterOffsetWhenReachedEnabled;

    if (isTypewriterScrollEnabled) {
      return calculateTypewriterScrollOffset({
        activeLineOffset,
        typewriterOffset,
        scrollTop: scrollDom.scrollTop,
        isOnlyMaintainTypewriterOffsetWhenReachedEnabled,
      });
    }

    if (isKeepLinesAboveAndBelowEnabled) {
      return this.calculateKeepLinesScrollOffset(
        activeLineOffset,
        editorDom,
        scrollDom
      );
    }

    return activeLineOffset;
  }

  private calculateKeepLinesScrollOffset(
    activeLineOffset: number,
    editorDom: HTMLElement,
    scrollDom: HTMLElement
  ): number {
    const linesAboveAndBelow =
      this.tm.settings.keepLinesAboveAndBelow.linesAboveAndBelow;
    return calculateKeepLinesScrollOffset({
      activeLineOffset,
      editorHeight: editorDom.clientHeight,
      lineHeight: this.view.defaultLineHeight,
      linesAboveAndBelow,
      scrollTop: scrollDom.scrollTop,
    });
  }

  getTypewriterPositionData() {
    const caretCoords = this.view.coordsAtPos(
      this.view.state.selection.main.head
    );
    if (!caretCoords) {
      return null;
    }

    const caretHeight = caretCoords.bottom - caretCoords.top;
    const lineHeightProp = this.getActiveLineProp("line-height");
    if (!lineHeightProp) {
      return null;
    }

    let lineHeight = 0;
    let lineOffset = 0;
    if (caretHeight > lineHeightProp) {
      lineHeight = caretHeight;
      lineOffset = 0;
    } else {
      lineHeight = lineHeightProp;
      lineOffset = (lineHeight - caretHeight) / 2;
    }

    const typewriterOffset = this.getTypewriterOffset();
    const activeLineOffset = this.getActiveLineOffset(caretCoords);

    const editorDom = getEditorDom(this.view);
    const scrollDom = getScrollDom(this.view);

    let scrollOffset: number;
    if (editorDom && scrollDom) {
      scrollOffset = this.calculateScrollOffset(
        activeLineOffset,
        typewriterOffset,
        editorDom,
        scrollDom
      );
    } else {
      scrollOffset = 0;
    }

    return {
      typewriterOffset,
      scrollOffset,
      activeLineOffset,
      lineHeight,
      lineOffset,
    };
  }
}

export interface TypewriterPositionData {
  activeLineOffset: number;
  lineHeight: number;
  lineOffset: number;
  scrollOffset: number;
  typewriterOffset: number;
}
