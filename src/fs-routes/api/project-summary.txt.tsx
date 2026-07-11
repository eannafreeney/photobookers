import { createRoute } from "hono-fsr";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  generateProjectSummary,
  PROJECT_SUMMARY_OUTPUT,
} from "@/lib/projectSummary/generateProjectSummary";

const SUMMARY_CACHE = "public, max-age=3600";

function readCommittedSummary(): string | null {
  try {
    return readFileSync(resolve(process.cwd(), PROJECT_SUMMARY_OUTPUT), "utf8");
  } catch {
    return null;
  }
}

export const GET = createRoute(async (c) => {
  const body =
    readCommittedSummary() ??
    generateProjectSummary({ rootDir: process.cwd() });

  return c.body(body, 200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": SUMMARY_CACHE,
  });
});
