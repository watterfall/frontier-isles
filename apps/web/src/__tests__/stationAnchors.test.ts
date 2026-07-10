import { describe, it, expect } from 'vitest';
import { STATION_KINDS } from '@frontier-isles/core';
import {
  STATION_TEX_SIZE,
  STATION_GROUND_OFFSET,
  stationGroundOffset,
  stationBakeOrigin,
  stationLabelHeight,
} from '../scene/stationAnchors';

/**
 * P1 per-station 垂直配准: before this table every station's Pixi texture bake
 * shared Workshop's own ground-contact offset, which visibly floated/sank
 * several stations and left Ferry Dock's stub art baked entirely outside the
 * 320×320 texture (invisible in the live L1 — confirmed via a Pixi demo
 * screenshot during this fix). These tests pin the arithmetic so a future
 * edit can't silently regress it.
 */
describe('stationAnchors — per-station ground offset table', () => {
  it('covers every station kind', () => {
    for (const kind of STATION_KINDS) {
      expect(STATION_GROUND_OFFSET[kind]).toBeDefined();
    }
  });

  it('stationGroundOffset never falls back for a real station kind', () => {
    for (const kind of STATION_KINDS) {
      expect(stationGroundOffset(kind)).toBe(STATION_GROUND_OFFSET[kind]);
    }
  });

  it('stationBakeOrigin centres each station\'s own ground marker on the texture', () => {
    for (const kind of STATION_KINDS) {
      const off = STATION_GROUND_OFFSET[kind];
      const origin = stationBakeOrigin(kind);
      // Drawing the station at `origin` puts its local ground marker (dx,dy)
      // at exactly (TEX_SIZE/2, TEX_SIZE/2) — the texture centre, which is
      // where the shared (0.5,0.5) Sprite anchor reads.
      expect(origin.x + off.dx).toBe(STATION_TEX_SIZE / 2);
      expect(origin.y + off.dy).toBe(STATION_TEX_SIZE / 2);
    }
  });

  it("every station's ground marker bakes inside the 320×320 texture (Ferry Dock regression)", () => {
    // Ferry Dock's stub art draws in absolute design-canvas coordinates; before
    // this table it baked to (160-836, 160-792) = way outside 0..320 — an
    // invisible station in the live L1. The bake origin itself must land
    // in-bounds (a necessary, not sufficient, check that the fix landed).
    for (const kind of STATION_KINDS) {
      const origin = stationBakeOrigin(kind);
      expect(origin.x + STATION_GROUND_OFFSET[kind].dx).toBeGreaterThanOrEqual(0);
      expect(origin.x + STATION_GROUND_OFFSET[kind].dx).toBeLessThanOrEqual(STATION_TEX_SIZE);
      expect(origin.y + STATION_GROUND_OFFSET[kind].dy).toBeGreaterThanOrEqual(0);
      expect(origin.y + STATION_GROUND_OFFSET[kind].dy).toBeLessThanOrEqual(STATION_TEX_SIZE);
    }
  });

  it('stationLabelHeight is positive for every station (label always floats above ground)', () => {
    for (const kind of STATION_KINDS) {
      expect(stationLabelHeight(kind)).toBeGreaterThan(0);
    }
  });

  it('a station with labelY gets a clearance derived from (dy − labelY); one without gets the generic fallback', () => {
    expect(stationLabelHeight('workshop')).toBeCloseTo((56 - -64) * (150 / (220 * 3)), 5);
    expect(stationLabelHeight('driftwood')).toBe(30); // no labelY in the table → generic fallback
  });
});
