import { gunzipSync } from "node:zlib";
import { createAscToken } from "./client.js";
const ASC_API_BASE = "https://api.appstoreconnect.apple.com/v1/salesReports";
const FIRST_TIME_PRODUCT_TYPES = /* @__PURE__ */ new Set(["1", "1F", "1T"]);
const REDOWNLOAD_PRODUCT_TYPES = /* @__PURE__ */ new Set(["3", "3F"]);
const DOWNLOAD_PRODUCT_TYPES = /* @__PURE__ */ new Set([
  ...FIRST_TIME_PRODUCT_TYPES,
  ...REDOWNLOAD_PRODUCT_TYPES
]);
async function fetchDailySalesReport(config, reportDate) {
  const token = createAscToken(config);
  const url = new URL(ASC_API_BASE);
  url.searchParams.set("filter[frequency]", "DAILY");
  url.searchParams.set("filter[reportType]", "SALES");
  url.searchParams.set("filter[reportSubType]", "SUMMARY");
  url.searchParams.set("filter[vendorNumber]", config.vendorNumber);
  url.searchParams.set("filter[reportDate]", reportDate);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/a-gzip"
    }
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `App Store Connect sales report failed (${response.status})${body ? `: ${body.slice(0, 200)}` : ""}`
    );
  }
  const compressed = Buffer.from(await response.arrayBuffer());
  const decompressed = gunzipSync(compressed).toString("utf8");
  return parseSalesReportTsv(decompressed);
}
function parseSalesReportTsv(tsv) {
  const lines = tsv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split("	");
  const productTypeIndex = headers.indexOf("Product Type Identifier");
  const unitsIndex = headers.indexOf("Units");
  const appleIdIndex = headers.indexOf("Apple Identifier");
  const countryCodeIndex = headers.indexOf("Country Code");
  if (productTypeIndex === -1 || unitsIndex === -1 || appleIdIndex === -1 || countryCodeIndex === -1) {
    throw new Error("Unexpected App Store Connect sales report format");
  }
  const rows = [];
  for (const line of lines.slice(1)) {
    const columns = line.split("	");
    const productType = columns[productTypeIndex]?.trim() ?? "";
    const units = Number.parseInt(columns[unitsIndex]?.trim() ?? "0", 10);
    const appleIdentifier = columns[appleIdIndex]?.trim() ?? "";
    const countryCode = columns[countryCodeIndex]?.trim() ?? "";
    if (!productType || Number.isNaN(units)) continue;
    rows.push({ productType, units, appleIdentifier, countryCode });
  }
  return rows;
}
function summarizeDownloadsForApp(rows, appId) {
  let downloads = 0;
  let firstTimeDownloads = 0;
  let redownloads = 0;
  for (const row of rows) {
    if (row.appleIdentifier !== appId) continue;
    if (!DOWNLOAD_PRODUCT_TYPES.has(row.productType)) continue;
    if (row.units <= 0) continue;
    downloads += row.units;
    if (FIRST_TIME_PRODUCT_TYPES.has(row.productType)) {
      firstTimeDownloads += row.units;
    } else if (REDOWNLOAD_PRODUCT_TYPES.has(row.productType)) {
      redownloads += row.units;
    }
  }
  return { downloads, firstTimeDownloads, redownloads };
}
function summarizeDownloadsByCountry(rows, appId) {
  const totals = /* @__PURE__ */ new Map();
  for (const row of rows) {
    if (row.appleIdentifier !== appId) continue;
    if (!DOWNLOAD_PRODUCT_TYPES.has(row.productType)) continue;
    if (row.units <= 0) continue;
    const countryCode = row.countryCode || "Unknown";
    const entry = totals.get(countryCode) ?? {
      countryCode,
      downloads: 0,
      firstTimeDownloads: 0,
      redownloads: 0
    };
    entry.downloads += row.units;
    if (FIRST_TIME_PRODUCT_TYPES.has(row.productType)) {
      entry.firstTimeDownloads += row.units;
    } else if (REDOWNLOAD_PRODUCT_TYPES.has(row.productType)) {
      entry.redownloads += row.units;
    }
    totals.set(countryCode, entry);
  }
  return [...totals.values()].sort((a, b) => {
    if (b.downloads !== a.downloads) return b.downloads - a.downloads;
    return a.countryCode.localeCompare(b.countryCode);
  });
}
export {
  fetchDailySalesReport,
  parseSalesReportTsv,
  summarizeDownloadsByCountry,
  summarizeDownloadsForApp
};
