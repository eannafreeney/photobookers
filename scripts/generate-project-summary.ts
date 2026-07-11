#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  generateProjectSummary,
  projectSummaryOutputPath,
} from "../src/lib/projectSummary/generateProjectSummary";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = projectSummaryOutputPath(rootDir);
const summary = generateProjectSummary({ rootDir });

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, summary, "utf8");

console.log(`Wrote ${outputPath} (${summary.length} bytes)`);
