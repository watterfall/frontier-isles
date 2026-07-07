import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { ProblemObjectSchema, type ProblemObject } from "./problem-object";

/**
 * Body of a problem object: free prose split into the four canonical sections
 * (architecture.md §5). zh-CN headings alias their English counterparts.
 * `raw` is the entire body verbatim; each section field is that section's inner
 * markdown (heading line excluded). Missing sections stay `undefined`.
 */
export interface ProblemBody {
  night?: string;
  bridge?: string;
  dayClaims?: string;
  openSubQuestions?: string;
  /** The full body markdown after the front-matter fence, verbatim. */
  raw: string;
}

type SectionKey = "night" | "bridge" | "dayClaims" | "openSubQuestions";

/** Heading text (lower-cased) → canonical section key. */
const SECTION_ALIASES: Record<string, SectionKey> = {
  night: "night",
  "夜": "night",
  bridge: "bridge",
  "渡": "bridge",
  "day claims": "dayClaims",
  "昼": "dayClaims",
  "open sub-questions": "openSubQuestions",
  "open subquestions": "openSubQuestions",
  "开放子问题": "openSubQuestions",
};

const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/** Split a `.md` into its YAML front-matter text and body text. */
function splitFrontMatter(md: string): { frontMatter: string; body: string } {
  const m = FRONT_MATTER_RE.exec(md);
  if (!m) {
    throw new Error("problem object is missing its `---` front-matter fence");
  }
  return { frontMatter: m[1] ?? "", body: m[2] ?? "" };
}

/** Parse the body into typed sections, tolerating missing/zh-CN headings. */
export function parseBody(body: string): ProblemBody {
  const result: ProblemBody = { raw: body };
  const lines = body.split(/\r?\n/);
  let currentKey: SectionKey | undefined;
  let buffer: string[] = [];

  const flush = () => {
    if (currentKey) {
      const text = buffer.join("\n").trim();
      // Later sections with the same key win only if non-empty; keep first seen.
      if (result[currentKey] === undefined) result[currentKey] = text;
    }
    buffer = [];
  };

  for (const line of lines) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      flush();
      const title = (heading[1] ?? "").trim().toLowerCase();
      currentKey = SECTION_ALIASES[title];
    } else if (currentKey) {
      buffer.push(line);
    }
  }
  flush();
  return result;
}

export interface ParsedProblemObject {
  object: ProblemObject;
  body: ProblemBody;
}

/**
 * Parse a full problem-object `.md`: validate the front-matter against the
 * schema and split the body into typed sections.
 */
export function parseProblemObject(md: string): ParsedProblemObject {
  const { frontMatter, body } = splitFrontMatter(md);
  const raw = parseYaml(frontMatter);
  const object = ProblemObjectSchema.parse(raw);
  return { object, body: parseBody(body) };
}

const CANONICAL_HEADINGS: Array<[SectionKey, string]> = [
  ["night", "Night"],
  ["bridge", "Bridge"],
  ["dayClaims", "Day claims"],
  ["openSubQuestions", "Open sub-questions"],
];

/**
 * Serialize a problem object back to `.md`. When a `body` is supplied its `raw`
 * is emitted verbatim (lossless round-trip); otherwise a body is reconstructed
 * from any populated section fields under canonical English headings.
 */
export function serializeProblemObject(object: ProblemObject, body?: ProblemBody): string {
  const frontMatter = stringifyYaml(object).replace(/\n+$/, "");
  let bodyText = "";
  if (body?.raw !== undefined && body.raw !== "") {
    bodyText = body.raw.replace(/^\n+|\n+$/g, "");
  } else if (body) {
    const parts: string[] = [];
    for (const [key, heading] of CANONICAL_HEADINGS) {
      const section = body[key];
      if (section !== undefined) parts.push(`## ${heading}\n\n${section}`);
    }
    bodyText = parts.join("\n\n");
  }
  return bodyText.length > 0
    ? `---\n${frontMatter}\n---\n\n${bodyText}\n`
    : `---\n${frontMatter}\n---\n`;
}
