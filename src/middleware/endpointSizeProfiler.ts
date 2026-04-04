import type { Context, Next } from "hono";

type EndpointStats = {
  hits: number;
  totalBytes: number;
  maxBytes: number;
  totalMs: number;
};

const endpointStats = new Map<string, EndpointStats>();
let leaderboardStarted = false;

function normalizePath(path: string): string {
  // Replace UUID-like segments
  let p = path.replace(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
    ":uuid",
  );

  // Replace long hex IDs/ObjectIds
  p = p.replace(/\b[a-f0-9]{24,}\b/gi, ":id");

  // Replace numeric IDs
  p = p.replace(/\b\d+\b/g, ":id");

  return p;
}

function formatTopEndpoints(limit = 20) {
  return [...endpointStats.entries()]
    .map(([key, s]) => ({
      key,
      hits: s.hits,
      avgBytes: Math.round(s.totalBytes / s.hits),
      maxBytes: s.maxBytes,
      avgMs: Math.round(s.totalMs / s.hits),
    }))
    .filter((r) => r.hits >= 3) // avoid noise
    .sort((a, b) => b.maxBytes - a.maxBytes)
    .slice(0, limit);
}

function startLeaderboardPrinter(intervalMs = 60_000) {
  if (leaderboardStarted) return;
  leaderboardStarted = true;

  setInterval(() => {
    const top = formatTopEndpoints(20);

    console.log("\n=== Top Endpoints by Max Response Size ===");
    if (top.length === 0) {
      console.log("No endpoint data yet.");
      return;
    }

    for (const row of top) {
      console.log(
        `${row.key} | hits=${row.hits} | avg=${row.avgBytes}B | max=${row.maxBytes}B | avgTime=${row.avgMs}ms`,
      );
    }
  }, intervalMs);
}

export async function endpointSizeProfiler(c: Context, next: Next) {
  if (c.req.path === "/api/activity/stream") {
    await next();
    return;
  }

  const started = performance.now();
  await next();

  const res = c.res;
  const routeKey = `${c.req.method} ${normalizePath(c.req.path)}`;

  // Prefer content-length header first
  let bytes: number | null = null;
  const headerLen = res.headers.get("content-length");
  if (headerLen) {
    const n = Number(headerLen);
    if (Number.isFinite(n)) bytes = n;
  }

  // Fallback: clone and measure body size
  if (bytes === null) {
    try {
      bytes = (await res.clone().arrayBuffer()).byteLength;
    } catch {
      // Streaming or uncloneable body
      bytes = 0;
    }
  }

  const ms = performance.now() - started;

  const prev = endpointStats.get(routeKey) ?? {
    hits: 0,
    totalBytes: 0,
    maxBytes: 0,
    totalMs: 0,
  };

  prev.hits += 1;
  prev.totalBytes += bytes;
  prev.maxBytes = Math.max(prev.maxBytes, bytes);
  prev.totalMs += ms;

  endpointStats.set(routeKey, prev);

  // Per-request log
  console.log(
    `[${c.req.method}] ${c.req.path} -> ${res.status} | ${bytes} bytes | ${Math.round(ms)}ms`,
  );
}

export function enableEndpointSizeProfiler(intervalMs = 60_000) {
  startLeaderboardPrinter(intervalMs);
  return endpointSizeProfiler;
}
