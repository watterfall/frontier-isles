#!/usr/bin/env node

/**
 * Explicit downstream pull from the local xFrontier stdio MCP.
 *
 * Default mode is read-only: load the owning modules, resolve every referenced
 * id, and print the diff against the checked-in snapshot. Snapshot mutation is
 * available only through --write-snapshot and happens via same-directory
 * temporary file + rename after all MCP responses have been validated.
 */
import { constants } from 'node:fs';
import { access, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { FRONTIERS, XFRONTIER_DATASET_VERSION } from '../src/frontiers.ts';
import { SEED_STRUCTURES } from '../src/structures.ts';
import {
  assertRequiredReadTools,
  assertExpectedServer,
  assertSnapshotWriteSafe,
  atomicWriteJsonIfUnchanged,
  collectReferencedIds,
  createReferenceSnapshot,
  diffReferenceSnapshots,
  formatHumanReport,
  readStructuredResult,
  validateReferenceSnapshot,
} from './xfrontier-sync-lib.mjs';

const snapshotPath = fileURLToPath(new URL('../xfrontier-reference-snapshot.json', import.meta.url));
const DEFAULT_SERVER_ENTRY = join(homedir(), 'AIAI', 'frontier', 'dist-mcp', 'server.mjs');
const MCP_REQUEST_TIMEOUT_MS = 15_000;

const usage = `Usage: pnpm xfrontier:sync [options]

Options:
  --json                 Print the full machine-readable report.
  --check                Exit 1 when the snapshot differs; never write.
  --write-snapshot       Atomically replace the snapshot only when it matches
                         the code dataset version and has zero unknown ids.
  --server-entry <path>  xFrontier stdio server (or XFRONTIER_MCP_SERVER).
  --command <path>       Runtime command (or XFRONTIER_MCP_COMMAND; default current Node).
  --help                 Show this help.

Default mode is read-only and exits 0 after printing the diff.
The command uses an already-built upstream MCP entry; it never builds or writes xFrontier.`;

function parseArgs(argv) {
  const options = {
    json: false,
    check: false,
    writeSnapshot: false,
    serverEntry: process.env.XFRONTIER_MCP_SERVER ?? DEFAULT_SERVER_ENTRY,
    command: process.env.XFRONTIER_MCP_COMMAND ?? process.execPath,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--check') options.check = true;
    else if (arg === '--write-snapshot') options.writeSnapshot = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--server-entry' || arg === '--command') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value`);
      options[arg === '--server-entry' ? 'serverEntry' : 'command'] = value;
      index += 1;
    } else throw new Error(`unknown option: ${arg}`);
  }
  if (options.check && options.writeSnapshot) {
    throw new Error('--check and --write-snapshot are mutually exclusive');
  }
  return options;
}

const localDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

async function pull(options) {
  const baselineContents = await readFile(snapshotPath, 'utf8');
  const baseline = JSON.parse(baselineContents);
  validateReferenceSnapshot(baseline, { allowLegacyMetadata: true });
  const requestedIds = collectReferencedIds(FRONTIERS, SEED_STRUCTURES);
  await access(options.serverEntry, constants.R_OK).catch((error) => {
    throw new Error(`xFrontier MCP server entry is not readable: ${options.serverEntry}`, { cause: error });
  });
  const transport = new StdioClientTransport({
    command: options.command,
    args: [options.serverEntry],
    stderr: 'inherit',
  });
  const client = new Client({ name: 'frontier-isles-xfrontier-sync', version: '0.1.0' });

  try {
    await client.connect(transport, { timeout: MCP_REQUEST_TIMEOUT_MS });
    const tools = await client.listTools({}, { timeout: MCP_REQUEST_TIMEOUT_MS });
    assertRequiredReadTools(tools.tools);

    const server = client.getServerVersion();
    assertExpectedServer(server);
    const stats = readStructuredResult(
      await client.callTool({ name: 'stats', arguments: {} }, undefined, { timeout: MCP_REQUEST_TIMEOUT_MS }),
      'stats',
    );
    const resolved = readStructuredResult(
      await client.callTool(
        { name: 'resolve_ids', arguments: { ids: requestedIds } },
        undefined,
        { timeout: MCP_REQUEST_TIMEOUT_MS },
      ),
      'resolve_ids',
    );
    const candidate = createReferenceSnapshot({
      requestedIds,
      datasetVersion: stats.dataset_version,
      serverVersion: server.version,
      resolved,
      reviewedAt: localDate(),
    });
    const diff = diffReferenceSnapshots(baseline, candidate);
    if (options.writeSnapshot) {
      assertSnapshotWriteSafe(candidate, XFRONTIER_DATASET_VERSION);
      await atomicWriteJsonIfUnchanged(snapshotPath, candidate, baselineContents);
    }

    return {
      schemaVersion: 'xfrontier-pull-report/v1',
      mode: options.writeSnapshot ? 'write-snapshot' : 'read-only',
      server: {
        name: server.name,
        version: server.version,
        entry: options.serverEntry,
        command: options.command,
      },
      snapshotPath,
      requestedReferenceCount: requestedIds.length,
      scope: {
        type: 'frontier-isles-referenced-slice',
        sources: ['FRONTIERS[].atlasN', 'SEED_STRUCTURES[].provenance.recordIds'],
        limitation: 'Unrelated corpus changes are detectable by datasetVersion but cannot be located without an upstream history or changes_since feed.',
      },
      candidate,
      diff,
      wroteSnapshot: options.writeSnapshot,
    };
  } finally {
    await client.close().catch(() => {});
  }
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage);
  } else {
    const report = await pull(options);
    console.log(options.json ? JSON.stringify(report, null, 2) : formatHumanReport(report));
    if (options.check && report.diff.changed) process.exitCode = 1;
  }
} catch (error) {
  console.error(`xfrontier:sync failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 2;
}
