import { z } from "zod";

/**
 * Problem-object front-matter schema — the machine contract of an `op://` island.
 * Mirrors architecture.md §5 exactly. Only the five identity fields
 * (schema, id, title, status, qfocus) are required; every other section carries
 * a sensible default so a minimal hand-written `.md` still validates.
 */

/** `op://<org>/prob/<slug>` */
export const OP_ID_RE = /^op:\/\/[A-Za-z0-9][A-Za-z0-9._-]*\/prob\/[A-Za-z0-9][A-Za-z0-9._-]*$/;
/** `sha256:<64 lowercase hex>` */
export const SHA256_RE = /^sha256:[0-9a-f]{64}$/;
/** agent identity must be a resolvable, prefixed DID/ORCID/GitHub id */
export const AGENT_ID_RE = /^(did:|orcid:|github:)/;
/** ledger reference `events://<op-id>` */
export const LEDGER_RE = /^events:\/\/op:\/\/[A-Za-z0-9][A-Za-z0-9._-]*\/prob\/[A-Za-z0-9][A-Za-z0-9._-]*$/;

export const OpId = z.string().regex(OP_ID_RE, "must be op://<org>/prob/<slug>");
const Sha256 = z.string().regex(SHA256_RE, "must be sha256:<64 hex>");
const Unit = z.number().min(0).max(1);

export const StatusSchema = z.enum(["open", "active", "dissolved", "resolved"]);
export type Status = z.infer<typeof StatusSchema>;

export const LineageSchema = z
  .object({
    parent: OpId.optional(),
    children: z.array(OpId).default([]),
  })
  .default({ children: [] });
export type Lineage = z.infer<typeof LineageSchema>;

export const FrontierSchema = z
  .object({
    heat: Unit.default(0),
    substrate: Unit.default(0),
    mode: z.string().default("variance-select"),
    score_ref: z.string().optional(),
  })
  .default({});
export type Frontier = z.infer<typeof FrontierSchema>;

export const HardwareRoleSchema = z.enum(["instrument", "fabrication", "sensor"]);
export type HardwareRole = z.infer<typeof HardwareRoleSchema>;

export const HardwareRefSchema = z.object({
  manifest: z.string().min(1),
  role: HardwareRoleSchema,
  hash: Sha256,
});
export type HardwareRef = z.infer<typeof HardwareRefSchema>;

export const DataRoleSchema = z.enum(["input", "output", "evidence", "replication"]);
export type DataRole = z.infer<typeof DataRoleSchema>;

export const DataRefSchema = z.object({
  ro_crate: z.string().min(1),
  role: DataRoleSchema,
  hash: Sha256,
});
export type DataRef = z.infer<typeof DataRefSchema>;

/** Aggregated from the ledger — never hand-edited (see reduceNightScience). */
export const NightScienceSchema = z
  .object({
    A: z.number().default(0),
    B: z.number().default(0),
    D: z.number().default(0),
  })
  .default({});
export type NightScience = z.infer<typeof NightScienceSchema>;

export const AgentRefSchema = z.object({
  id: z.string().regex(AGENT_ID_RE, "agent id must be did:/orcid:/github: prefixed"),
  capabilities: z.array(z.string()).default([]),
});
export type AgentRef = z.infer<typeof AgentRefSchema>;

const LedgerRef = z.string().regex(LEDGER_RE, "must be events://<op-id>");

export const ProblemObjectSchema = z
  .object({
    schema: z.literal("opp/0.2"),
    id: OpId,
    title: z.string().min(1),
    status: StatusSchema,
    qfocus: z.string().min(1),
    lineage: LineageSchema,
    frontier: FrontierSchema,
    hardware: z.array(HardwareRefSchema).default([]),
    data: z.array(DataRefSchema).default([]),
    night_science: NightScienceSchema,
    agents: z.array(AgentRefSchema).default([]),
    ledger: LedgerRef.optional(),
    license: z.string().default("CC-BY-4.0"),
  })
  .transform((o) => ({
    ...o,
    // §5: ledger addresses the object's own event stream; derive if omitted.
    ledger: o.ledger ?? `events://${o.id}`,
  }));

export type ProblemObject = z.infer<typeof ProblemObjectSchema>;
/** Shape of the raw (pre-default) front-matter accepted by the schema. */
export type ProblemObjectInput = z.input<typeof ProblemObjectSchema>;
