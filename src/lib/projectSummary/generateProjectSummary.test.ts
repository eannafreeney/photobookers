import { describe, expect, it } from "vitest";
import {
  extractCronJobNames,
  extractSchemaSummary,
  extractUrlPaths,
  groupRoutes,
} from "./generateProjectSummary";

describe("generateProjectSummary extractors", () => {
  it("extracts url paths from manifest", () => {
    const source = `
      { urlPath: "/books", filePath: "x" },
      { urlPath: "/api/newsletter", filePath: "y" },
    `;
    expect(extractUrlPaths(source)).toEqual(["/api/newsletter", "/books"]);
  });

  it("groups routes by surface", () => {
    const paths = [
      "/",
      "/books",
      "/api/newsletter",
      "/auth/login",
      "/dashboard/admin",
      "/hyperview/(app)/search",
      "/jobs/cron/daily-product-digest",
      "/claims/complete",
    ];
    const groups = groupRoutes(paths);
    expect(groups.find((g) => g.name === "Public web")?.count).toBe(2);
    expect(groups.find((g) => g.name === "API")?.count).toBe(1);
    expect(groups.find((g) => g.name === "Auth")?.count).toBe(1);
  });

  it("extracts tables and enums from schema", () => {
    const source = `
      export const users = pgTable("users", {});
      export const bookStatus = pgEnum("book_status", ["draft"]);
    `;
    expect(extractSchemaSummary(source)).toEqual({
      tables: ["users"],
      enums: ["book_status"],
    });
  });

  it("extracts cron job names", () => {
    const source = `
      export const CRON_JOB_NAMES = [
        "daily-botd-instagram",
        "ceo-metrics-email",
      ] as const;
    `;
    expect(extractCronJobNames(source)).toEqual([
      "daily-botd-instagram",
      "ceo-metrics-email",
    ]);
  });
});
