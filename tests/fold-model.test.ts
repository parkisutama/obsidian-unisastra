import { foldEffect, foldState, unfoldEffect } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { normalizeFoldState } from "@/capabilities/features/fold-persist/settings";
import {
  captureFolds,
  restoreFolds,
  uniqueBlockIds,
} from "@/cm6/outliner/fold-model";

describe("fold persistence snapshots", () => {
  it("normalizes malformed legacy maps without removing valid false values", () => {
    expect(
      normalizeFoldState({
        good: { id: false, bad: "yes", constructor: true },
        bad: [],
      })
    ).toEqual({ good: { id: false } });
    expect(normalizeFoldState(null)).toEqual({});
  });
  const items = [
    { id: "parent", from: 10, to: 40 },
    { id: "child", from: 20, to: 30 },
  ];
  const empty = () =>
    EditorState.create({ doc: "x".repeat(50), extensions: [foldState] });
  it("captures actual nested ranges, including false after unfold", () => {
    const state = empty().update({
      effects: items.map((item) => foldEffect.of(item)),
    }).state;
    expect(captureFolds(state, items)).toEqual({ parent: true, child: true });
    const unfolded = state.update({ effects: unfoldEffect.of(items[0]) }).state;
    expect(captureFolds(unfolded, items)).toEqual({
      parent: false,
      child: true,
    });
  });
  it("restores effects without touching text or selection and ignores unknown values", () => {
    const state = empty();
    const updated = state.update({
      effects: restoreFolds(state, items, {
        parent: true,
        child: "bad",
        gone: true,
      }),
    }).state;
    expect(captureFolds(updated, items)).toEqual({
      parent: true,
      child: false,
    });
    expect(updated.doc.eq(state.doc)).toBe(true);
    expect(updated.selection.eq(state.selection)).toBe(true);
    expect(restoreFolds(updated, items, { parent: true })).toEqual([]);
  });
  it("rejects ambiguous IDs across the entire document", () => {
    expect([
      ...uniqueBlockIds("- a ^same\n  - b ^unique\ntext ^same\n- c ^__proto__"),
    ]).toEqual(["unique"]);
  });
});
