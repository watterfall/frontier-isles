import { WebSocketServer, type WebSocket } from "ws";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import type { ProblemObject } from "@frontier-isles/opp";
import type { Store } from "./store.js";

/**
 * Minimal server-side y-websocket protocol (§5 sync rule: CRDT only intra-
 * artifact). Rooms: `island:<slug>` (presence awareness) and
 * `island:<slug>:canvas` (whiteboard doc). Docs are in-memory. When a room
 * empties we fold the canvas into one `bridge_artifact` ledger event — the
 * "save" semantic boundary (§5).
 *
 * The y-websocket wire format is implemented directly on top of `yjs` + a
 * hand-rolled varint codec: `lib0` is not a direct dependency of this package,
 * so we cannot pass lib0 encoders to `y-protocols/sync`. Awareness uses
 * `y-protocols/awareness`, whose API takes and returns plain `Uint8Array`s.
 *
 *   messageSync(0):  subtype syncStep1(0) | syncStep2(1) | update(2)
 *   messageAwareness(1): a single awareness update
 */

const messageSync = 0;
const messageAwareness = 1;
const syncStep1 = 0;
const syncStep2 = 1;
const syncUpdate = 2;

// --- tiny varint codec (unsigned LEB128) -----------------------------------

class Writer {
  bytes: number[] = [];
  u(n: number): this {
    let v = n >>> 0;
    while (v > 127) {
      this.bytes.push(128 | (v & 127));
      v = Math.floor(v / 128);
    }
    this.bytes.push(v & 127);
    return this;
  }
  bin(a: Uint8Array): this {
    this.u(a.length);
    for (const b of a) this.bytes.push(b);
    return this;
  }
  out(): Uint8Array {
    return Uint8Array.from(this.bytes);
  }
}

class Reader {
  i = 0;
  constructor(public buf: Uint8Array) {}
  u(): number {
    let n = 0;
    let shift = 0;
    let b: number;
    do {
      b = this.buf[this.i++]!;
      n |= (b & 127) << shift;
      shift += 7;
    } while (b & 128);
    return n >>> 0;
  }
  bin(): Uint8Array {
    const len = this.u();
    const s = this.buf.slice(this.i, this.i + len);
    this.i += len;
    return s;
  }
  get done(): boolean {
    return this.i >= this.buf.length;
  }
}

interface Room {
  name: string;
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  conns: Map<WebSocket, Set<number>>;
}

export interface YjsHandler {
  handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): boolean;
  rooms: Map<string, Room>;
  /** Test hook: fold a canvas room immediately. */
  foldRoom(name: string): void;
  closeAll(): void;
}

export function createYjsHandler(store: Store): YjsHandler {
  const wss = new WebSocketServer({ noServer: true });
  const rooms = new Map<string, Room>();

  function getRoom(name: string): Room {
    let room = rooms.get(name);
    if (room) return room;
    const doc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(doc);
    room = { name, doc, awareness, conns: new Map() };
    rooms.set(name, room);

    doc.on("update", (update: Uint8Array, origin: unknown) => {
      const msg = new Writer().u(messageSync).u(syncUpdate).bin(update).out();
      broadcast(room!, msg, origin);
    });

    awareness.on(
      "update",
      (
        { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
        origin: unknown,
      ) => {
        if (origin && room!.conns.has(origin as WebSocket)) {
          const controlled = room!.conns.get(origin as WebSocket)!;
          for (const id of added) controlled.add(id);
          for (const id of removed) controlled.delete(id);
        }
        const changed = added.concat(updated, removed);
        const bytes = awarenessProtocol.encodeAwarenessUpdate(awareness, changed);
        const msg = new Writer().u(messageAwareness).bin(bytes).out();
        broadcast(room!, msg, origin);
      },
    );
    return room;
  }

  function broadcast(room: Room, message: Uint8Array, origin: unknown) {
    for (const ws of room.conns.keys()) {
      if (ws === origin) continue;
      if (ws.readyState === ws.OPEN) ws.send(message);
    }
  }

  function foldCanvas(room: Room) {
    const m = /^island:(.+):canvas$/.exec(room.name);
    if (!m) return;
    const target = store.getProblemRow(m[1]!);
    if (!target) return;
    const snapshot = Y.encodeStateAsUpdate(room.doc);
    if (snapshot.length <= 2) return; // empty doc
    const strokes = room.doc.getArray("strokes").toJSON();
    const ref = store.putRef("canvas_snapshot", { strokes, bytes: snapshot.length });
    store.appendRaw(target.opId, {
      ts: new Date().toISOString(),
      op: target.opId as ProblemObject["id"],
      actor: { id: "github:canvas", kind: "pair" },
      credit: ["canvas-fold"],
      phase: "B",
      action: "bridge_artifact",
      ref,
    });
    store.addPlacement(target.opId, "canvas", ref, { action: "bridge_artifact", kind: "canvas_snapshot" });
  }

  function setup(ws: WebSocket, roomName: string) {
    const room = getRoom(roomName);
    room.conns.set(ws, new Set());
    ws.binaryType = "arraybuffer";

    ws.on("message", (data: ArrayBuffer | Buffer) => {
      const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data);
      const r = new Reader(bytes);
      const type = r.u();
      if (type === messageSync) {
        const sub = r.u();
        if (sub === syncStep1) {
          const sv = r.bin();
          const update = Y.encodeStateAsUpdate(room.doc, sv);
          ws.send(new Writer().u(messageSync).u(syncStep2).bin(update).out());
        } else if (sub === syncStep2 || sub === syncUpdate) {
          const update = r.bin();
          Y.applyUpdate(room.doc, update, ws);
        }
      } else if (type === messageAwareness) {
        const update = r.bin();
        awarenessProtocol.applyAwarenessUpdate(room.awareness, update, ws);
      }
    });

    ws.on("close", () => {
      const controlled = room.conns.get(ws);
      room.conns.delete(ws);
      if (controlled && controlled.size > 0) {
        awarenessProtocol.removeAwarenessStates(room.awareness, [...controlled], "close");
      }
      if (room.conns.size === 0) {
        try {
          foldCanvas(room);
        } catch {
          /* fold is best-effort */
        }
        room.awareness.destroy();
        room.doc.destroy();
        rooms.delete(room.name);
      }
    });

    // Sync step 1 (server → client).
    ws.send(new Writer().u(messageSync).u(syncStep1).bin(Y.encodeStateVector(room.doc)).out());

    // Initial awareness snapshot.
    const states = room.awareness.getStates();
    if (states.size > 0) {
      const bytes = awarenessProtocol.encodeAwarenessUpdate(room.awareness, [...states.keys()]);
      ws.send(new Writer().u(messageAwareness).bin(bytes).out());
    }
  }

  function handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): boolean {
    const url = new URL(req.url ?? "/", "http://localhost");
    const m = /^\/yjs\/(.+)$/.exec(url.pathname);
    if (!m) return false;
    const roomName = decodeURIComponent(m[1]!);
    wss.handleUpgrade(req, socket, head, (ws) => setup(ws, roomName));
    return true;
  }

  return {
    handleUpgrade,
    rooms,
    foldRoom(name: string) {
      const room = rooms.get(name);
      if (room) foldCanvas(room);
    },
    closeAll() {
      for (const room of rooms.values()) {
        for (const ws of room.conns.keys()) ws.close();
      }
      wss.close();
    },
  };
}
