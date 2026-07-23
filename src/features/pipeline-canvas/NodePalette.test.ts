import { describe, expect, it } from "vitest";
import {
  encodePaletteDragPayload,
  parsePaletteDragPayload,
} from "@/features/pipeline-canvas/NodePalette";

describe("encodePaletteDragPayload / parsePaletteDragPayload", () => {
  it("round-trips a plain kind entry with no connectorId", () => {
    const encoded = encodePaletteDragPayload({ kind: "transform" });

    expect(parsePaletteDragPayload(encoded)).toEqual({ kind: "transform", connectorId: undefined });
  });

  it("round-trips a connector entry's kind + connectorId", () => {
    const encoded = encodePaletteDragPayload({ kind: "source", connectorId: "greenhouse" });

    expect(parsePaletteDragPayload(encoded)).toEqual({ kind: "source", connectorId: "greenhouse" });
  });

  it("returns null for non-JSON drag data (e.g. dragged plain text)", () => {
    expect(parsePaletteDragPayload("just some text")).toBeNull();
  });

  it("returns null for JSON with an unrecognized kind", () => {
    expect(parsePaletteDragPayload(JSON.stringify({ kind: "bogus" }))).toBeNull();
  });

  it("returns null for JSON missing a kind entirely", () => {
    expect(parsePaletteDragPayload(JSON.stringify({ connectorId: "greenhouse" }))).toBeNull();
  });

  it("ignores a non-string connectorId rather than propagating a malformed value", () => {
    const malformed = JSON.stringify({ kind: "source", connectorId: 42 });

    expect(parsePaletteDragPayload(malformed)).toEqual({ kind: "source", connectorId: undefined });
  });
});
