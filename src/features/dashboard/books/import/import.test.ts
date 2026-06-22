import { describe, expect, it } from "vitest";
import { parseCsvContent } from "./parseCsv";
import { buildImportTemplateCsv } from "./buildTemplate";
import { validateImportRows, getValidRows } from "./validateRows";
import { rowToBookFormData } from "./rowToBookFormData";

describe("parseCsvContent", () => {
  it("parses comma-delimited CSV with headers", () => {
    const csv = `title,description,release_date,tags,purchase_link,availability_status,artist,publisher
My First Book,A description,2024-01-15,photo,https://buy.example.com,available,Jane Artist,`;
    const result = parseCsvContent(csv);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.row.title).toBe("My First Book");
    expect(result.rows[0]?.rowNumber).toBe(2);
  });

  it("parses semicolon-delimited CSV", () => {
    const csv = `title;description;artist
Another Book;Desc;Artist Name`;
    const result = parseCsvContent(csv);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows[0]?.row.title).toBe("Another Book");
  });

  it("normalizes availability aliases", () => {
    const csv = `title,availability_status
Sold Out Book,sold out`;
    const result = parseCsvContent(csv);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows[0]?.row.availability_status).toBe("sold_out");
  });

  it("rejects empty CSV", () => {
    expect(parseCsvContent("   ").ok).toBe(false);
  });

  it("rejects CSV exceeding row limit", () => {
    const header = "title\n";
    const rows = Array.from({ length: 101 }, (_, i) => `Book ${i}`).join("\n");
    const result = parseCsvContent(header + rows);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("101");
  });
});

describe("validateImportRows", () => {
  const baseRow = {
    row: { title: "Valid Title", availability_status: "available" as const },
    rowNumber: 2,
  };

  it("accepts valid artist creator rows", () => {
    const results = validateImportRows([baseRow], "artist");
    expect(results[0]?.valid).toBe(true);
    expect(getValidRows(results)).toHaveLength(1);
  });

  it("requires artist for publisher creators", () => {
    const results = validateImportRows([baseRow], "publisher");
    expect(results[0]?.valid).toBe(false);
    expect(results[0]?.errors).toContain(
      "Artist is required for publisher imports",
    );
  });

  it("rejects short titles", () => {
    const results = validateImportRows(
      [{ row: { title: "ab" }, rowNumber: 3 }],
      "artist",
    );
    expect(results[0]?.valid).toBe(false);
  });

  it("rejects invalid release dates", () => {
    const results = validateImportRows(
      [{ row: { title: "Valid Title", release_date: "01-15-2024" }, rowNumber: 3 }],
      "artist",
    );
    expect(results[0]?.valid).toBe(false);
  });
});

describe("rowToBookFormData", () => {
  const row = {
    rowNumber: 2,
    title: "My Book",
    description: "Desc",
    release_date: "2024-06-01",
    tags: "photo",
    purchase_link: "https://example.com",
    availability_status: "available" as const,
    artist: "Jane Artist",
    publisher: "Example Press",
  };

  it("maps publisher creator rows with artist name", () => {
    const form = rowToBookFormData(row, "publisher");
    expect(form.intent).toBe("publisher");
    expect(form.new_artist_name).toBe("Jane Artist");
  });

  it("maps artist creator rows with optional publisher", () => {
    const form = rowToBookFormData(row, "artist");
    expect(form.intent).toBe("artist");
    expect(form.new_publisher_name).toBe("Example Press");
  });
});

describe("buildImportTemplateCsv", () => {
  it("includes publisher column but not artist for artist creators", () => {
    const csv = buildImportTemplateCsv("artist");
    const [headerLine] = csv.split("\n");
    expect(headerLine).toContain("publisher");
    expect(headerLine).not.toContain("artist");
    expect(csv.split("\n")).toHaveLength(2);
  });

  it("includes artist column but not publisher for publisher creators", () => {
    const csv = buildImportTemplateCsv("publisher");
    const [headerLine] = csv.split("\n");
    expect(headerLine).toContain("artist");
    expect(headerLine).not.toContain("publisher");
    expect(csv.split("\n")).toHaveLength(2);
  });
});
