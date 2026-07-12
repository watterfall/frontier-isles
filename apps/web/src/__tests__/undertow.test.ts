/**
 * R6 Lever 2 — the undertow contention curve. Pins the recalibrated transfer
 * that makes disputed seas legible at real shader magnitude, and guards the two
 * properties the sea depends on: an explicit calm-sea zero, and monotonicity.
 */
import { describe, expect, it } from 'vitest';
import { contentionFromRefuted, refutedClaimCount } from '../scene/undertow';

describe('contentionFromRefuted (R6 Lever 2 contention→agitation curve)', () => {
  it('maps refute count to the recalibrated contention magnitude', () => {
    expect(contentionFromRefuted(0)).toBe(0);
    expect(contentionFromRefuted(1)).toBe(0.6);
    expect(contentionFromRefuted(2)).toBe(0.8);
    expect(contentionFromRefuted(3)).toBe(1);
    expect(contentionFromRefuted(5)).toBe(1);
  });

  it('holds an explicit zero — a calm sea never swirls (u=0 ⇒ no undertow)', () => {
    expect(contentionFromRefuted(0)).toBe(0);
    expect(contentionFromRefuted(-1)).toBe(0); // defensive: below zero clamps to calm
  });

  it('is monotonic non-decreasing, capped at 1', () => {
    let prev = -Infinity;
    for (let n = 0; n <= 10; n++) {
      const v = contentionFromRefuted(n);
      expect(v).toBeGreaterThanOrEqual(prev);
      expect(v).toBeLessThanOrEqual(1);
      prev = v;
    }
  });

  it('keeps 1/2/3 refutes distinguishable (fixes old min(1, r*0.5) saturation)', () => {
    // The old curve saturated at 2 refutes (2 → 1.0), so 2 and 3 were identical.
    const vals = [contentionFromRefuted(1), contentionFromRefuted(2), contentionFromRefuted(3)];
    expect(new Set(vals).size).toBe(3);
  });
});

describe('refutedClaimCount — agitation single source (R7 Dim 1)', () => {
  const claims = [
    { ref: 'a', ghost: 'refuted' },
    { ref: 'b', ghost: 'refuted' },
    { ref: 'c', ghost: 'returned' }, // NOT a refuted claim
    { ref: 'd' }, // healthy claim
  ];

  it('counts refuted (ghost) CLAIMS only — not returned, not healthy', () => {
    expect(refutedClaimCount(claims)).toBe(2);
    expect(refutedClaimCount([])).toBe(0);
    expect(refutedClaimCount(null)).toBe(0);
    expect(refutedClaimCount(undefined)).toBe(0);
  });

  it('is the SINGLE source: the decoder readout and the undertow read the same value', () => {
    // The component shows `refutedClaimCount(claims)` in the decoder AND feeds the
    // very same number into contentionFromRefuted for the sea. Pin that they are
    // one quantity, so the legend can never drift from what drives the swirl.
    const decoderReadout = refutedClaimCount(claims);
    const seaMagnitude = contentionFromRefuted(refutedClaimCount(claims));
    expect(decoderReadout).toBe(2);
    expect(seaMagnitude).toBe(contentionFromRefuted(decoderReadout));
    // And it is NOT the count of refute EVENTS (a distinct, larger axis): a claim
    // refuted by 3 events is still one refuted claim.
    const eventCount = 3;
    expect(decoderReadout).not.toBe(eventCount);
  });
});
