import type { FlowType } from "@frontier-isles/opp";
import { BRIDGE_ARTIFACT_TYPES, type BridgeArtifactType } from "./atoms";
import { STATION_KINDS, type StationKind } from "./stations";

/**
 * Transplant-through-dock (architecture.md §4, Phase B.3). A transplant is the
 * ONLY path a driftwood atom takes into a formal station, and it "always passes
 * the dock, forming one of the four bridge artifacts; 'once driftwood' marks
 * persist." This module is the pure data shape of that move — no I/O, no ledger,
 * no placement: the server (`store.transplant`) stores the artifact as a
 * content-addressed `bridge_artifact` ref and writes exactly one `transplant`
 * event pointing at it.
 *
 * The load-bearing invariant lives in {@link BridgeArtifactContent.onceDriftwood}:
 * the source driftwood ref is recorded INSIDE the bridge artifact's ref content,
 * so the "once driftwood" mark travels with the artifact forever and is never
 * inlined into (nor recoverable only from) the append-only event.
 */

/**
 * Stations a transplant may land at: the seven formal stations. The Driftwood
 * Garden is the *source* of a transplant and the Ferry Dock is the mandatory
 * pass-through — neither is ever a valid target.
 */
export const TRANSPLANT_TARGETS: readonly StationKind[] = STATION_KINDS.filter(
  (k) => k !== "driftwood" && k !== "dock",
);

export interface TransplantInput {
  /** Content-addressed ref of the source driftwood atom (the `sha256:…` an event carries). */
  driftwoodRef: string;
  /** Which of the four bridge artifacts this transplant forms. */
  type: BridgeArtifactType;
  /** Target formal station (must be one of {@link TRANSPLANT_TARGETS}). */
  dest: StationKind;
  /** Optional artifact body (the human's framing of the transplant). */
  body?: string;
  /** Optional cross-layer flow tag (one of the six; architecture.md §4). */
  flow?: FlowType;
}

/**
 * The persistent content stored as the `bridge_artifact` ref a transplant forms.
 * `onceDriftwood` is the never-dropped provenance mark — "'once driftwood' marks
 * persist" (architecture §4).
 */
export interface BridgeArtifactContent {
  type: BridgeArtifactType;
  body: string;
  dest: StationKind;
  /** The source driftwood ref — the persistent "once driftwood" mark. */
  onceDriftwood: string;
}

export interface TransplantBuild {
  /** The bridge artifact ref content the server should `putRef("bridge_artifact", …)`. */
  artifact: BridgeArtifactContent;
  /** Non-chain params of the single `transplant` event (phase is always B — the bridge layer). */
  event: { action: "transplant"; phase: "B"; flow?: FlowType };
}

/**
 * Build the data shape of a transplant. Pure and total (throws on invalid
 * input); the server layers I/O, capability checks, and the actual ledger
 * append + dock→station placements on top of this.
 */
export function buildTransplant(input: TransplantInput): TransplantBuild {
  if (!input.driftwoodRef) throw new Error("transplant: driftwoodRef is required");
  if (!(BRIDGE_ARTIFACT_TYPES as readonly string[]).includes(input.type)) {
    throw new Error(`transplant: invalid bridge artifact type: ${input.type}`);
  }
  if (!(TRANSPLANT_TARGETS as readonly string[]).includes(input.dest)) {
    throw new Error(`transplant: invalid target station: ${input.dest}`);
  }
  return {
    artifact: {
      type: input.type,
      body: input.body ?? "",
      dest: input.dest,
      onceDriftwood: input.driftwoodRef,
    },
    event: { action: "transplant", phase: "B", ...(input.flow ? { flow: input.flow } : {}) },
  };
}
