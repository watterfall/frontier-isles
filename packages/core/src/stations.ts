/**
 * The nine station kinds of an island (architecture.md §3). `kind` is the
 * data-plane identifier; `seal` is the glyph stamped on the station's placard.
 */

export const STATION_KINDS = [
  "questions",
  "data",
  "canvas",
  "library",
  "workshop",
  "gallery",
  "tearoom",
  "driftwood",
  "dock",
] as const;

export type StationKind = (typeof STATION_KINDS)[number];

export interface StationMeta {
  kind: StationKind;
  zh: string;
  en: string;
  /** Single-character seal glyph (问数板文坊展茶木渡). */
  seal: string;
  note: string;
}

export const STATION_META: Record<StationKind, StationMeta> = {
  questions: {
    kind: "questions",
    zh: "问题墙",
    en: "Question Wall",
    seal: "问",
    note: "QFT genesis; the island's founding station.",
  },
  data: {
    kind: "data",
    zh: "数据台",
    en: "Data Bench",
    seal: "数",
    note: "Dataset refs by role: input / output / evidence / replication.",
  },
  canvas: {
    kind: "canvas",
    zh: "白板厅",
    en: "Whiteboard Hall",
    seal: "板",
    note: "Live co-editing surface (Yjs).",
  },
  library: {
    kind: "library",
    zh: "文献阁",
    en: "Library",
    seal: "文",
    note: "Literature refs (CrossRef, Web Annotation).",
  },
  workshop: {
    kind: "workshop",
    zh: "实验坊",
    en: "Workshop",
    seal: "坊",
    note: "Runnable artifacts + hardware refs: instrument / fabrication / sensor.",
  },
  gallery: {
    kind: "gallery",
    zh: "展厅",
    en: "Gallery",
    seal: "展",
    note: "Day curation: the sole source of the daytime view and of publication.",
  },
  tearoom: {
    kind: "tearoom",
    zh: "茶寮",
    en: "Tearoom",
    seal: "茶",
    note: "Never metricized.",
  },
  driftwood: {
    kind: "driftwood",
    zh: "散木园",
    en: "Driftwood Garden",
    seal: "木",
    note: "Night wilds; the AI's default landing; private by default.",
  },
  dock: {
    kind: "dock",
    zh: "渡口",
    en: "Ferry Dock",
    seal: "渡",
    note: "Bridge layer; all transplants pass through; morning reports issue here; the ferryman berths here.",
  },
};

/** Ordered seal string for the nine stations. */
export const STATION_SEALS = STATION_KINDS.map((k) => STATION_META[k].seal).join("");
