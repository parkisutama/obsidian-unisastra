import { describe, expect, it } from "vitest";
import {
  calloutEdit,
  changeCalloutType,
  hasAmbiguousCalloutHeader,
  wrapAsCallout,
} from "@/capabilities/features/callouts/markdown";

describe("wrapAsCallout", () => {
  it("wraps a single-line selection under a callout header", () => {
    expect(wrapAsCallout("hello world", "note")).toBe(
      "> [!note]\n> hello world"
    );
  });
  it("wraps a multiline selection, preserving blank lines as bare quote markers", () => {
    expect(wrapAsCallout("first\n\nsecond", "warning")).toBe(
      "> [!warning]\n> first\n>\n> second"
    );
  });
  it("supports a custom hyphenated ID", () => {
    expect(wrapAsCallout("body", "my-custom-id")).toBe(
      "> [!my-custom-id]\n> body"
    );
  });
});

describe("changeCalloutType", () => {
  it("swaps only the type, keeping fold marker and title intact", () => {
    expect(
      changeCalloutType("> [!note]- Custom title\n> body", "warning")
    ).toBe("> [!warning]- Custom title\n> body");
  });
  it("preserves nested quote depth untouched", () => {
    expect(changeCalloutType(">> [!note]\n>> nested body", "tip")).toBe(
      ">> [!tip]\n>> nested body"
    );
  });
  it("supports changing to a custom hyphenated ID", () => {
    expect(changeCalloutType("> [!note]\n> body", "my-custom-id")).toBe(
      "> [!my-custom-id]\n> body"
    );
  });
  it("returns null when the first line is not a callout header", () => {
    expect(changeCalloutType("plain text", "note")).toBeNull();
  });
});

describe("hasAmbiguousCalloutHeader", () => {
  it("is false for a normal callout starting at the first line", () => {
    expect(hasAmbiguousCalloutHeader("> [!note]\n> body")).toBe(false);
  });
  it("is false for plain text with no callout header at all", () => {
    expect(hasAmbiguousCalloutHeader("just some text")).toBe(false);
  });
  it("is true when a callout header appears after the first line", () => {
    expect(hasAmbiguousCalloutHeader("some text\n> [!note]\n> body")).toBe(
      true
    );
  });
});

describe("calloutEdit", () => {
  it("writes each of the five GitHub markers without changing body lines", () => {
    for (const id of ["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"]) {
      expect(calloutEdit("first\n\nlast", id, "github")).toEqual({
        insert: `> [!${id}]\n> first\n>\n> last`,
      });
      expect(calloutEdit("> [!note]\n> body", id, "github")).toEqual({
        insert: `> [!${id}]\n> body`,
      });
    }
  });
  it("refuses incompatible GitHub selections without providing a replacement", () => {
    for (const text of [
      "> [!note]-\n> body",
      "> [!note] Title\n> body",
      ">> [!note]\n>> body",
      "> [!custom]\n> body",
      "> [!note]\n> > [!tip]\n> > body",
      "plain\n> [!note]\n> body",
      "> ordinary quote",
    ]) {
      expect(calloutEdit(text, "NOTE", "github")).toHaveProperty("refusal");
    }
    expect(calloutEdit("body", "custom", "github")).toHaveProperty("refusal");
  });
  it("wraps plain text when there is no existing callout", () => {
    expect(calloutEdit("hello", "note")).toEqual({
      insert: "> [!note]\n> hello",
    });
  });
  it("changes an existing callout's type", () => {
    expect(calloutEdit("> [!note]\n> body", "danger")).toEqual({
      insert: "> [!danger]\n> body",
    });
  });
  it("refuses a selection that cuts through an existing callout header", () => {
    const result = calloutEdit("intro\n> [!note]\n> body", "danger");
    expect("refusal" in result && result.refusal).toMatch("cuts through");
  });
});
