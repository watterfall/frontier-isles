/**
 * @frontier-isles/opp — the Open Problem Protocol (OPP).
 *
 * Two contracts, per architecture.md §5:
 *   1. the problem-object `.md` (front-matter schema + body sections)
 *   2. the append-only, hash-chained ledger event
 *
 * Reads are projections over these; this package owns neither place nor UI.
 */

// Problem object
export {
  ProblemObjectSchema,
  StatusSchema,
  LineageSchema,
  FrontierSchema,
  HardwareRefSchema,
  HardwareRoleSchema,
  DataRefSchema,
  DataRoleSchema,
  NightScienceSchema,
  AgentRefSchema,
  OpId,
  OP_ID_RE,
  SHA256_RE,
  AGENT_ID_RE,
  LEDGER_RE,
} from "./problem-object";
export type {
  ProblemObject,
  ProblemObjectInput,
  Status,
  Lineage,
  Frontier,
  HardwareRef,
  HardwareRole,
  DataRef,
  DataRole,
  NightScience,
  AgentRef,
} from "./problem-object";

// Markdown parsing / serialization
export {
  parseProblemObject,
  serializeProblemObject,
  parseBody,
} from "./markdown";
export type { ProblemBody, ParsedProblemObject } from "./markdown";

// Ledger
export {
  LedgerEventSchema,
  ActorSchema,
  ActorKindSchema,
  PhaseSchema,
  ActionTypeSchema,
  FlowTypeSchema,
  hashEvent,
  appendEvent,
  verifyChain,
  reduceNightScience,
  canonicalStringify,
} from "./ledger";
export type {
  LedgerEvent,
  Actor,
  ActorKind,
  Phase,
  ActionType,
  FlowType,
  UnchainedEvent,
  ChainVerification,
  NightScienceCounts,
} from "./ledger";
