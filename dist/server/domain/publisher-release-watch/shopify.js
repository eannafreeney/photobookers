const PAGE_SIZE = 250;
const USER_AGENT = "PhotobookersReleaseWatch/1.0";
function productsJsonPageUrl(baseUrl, page) {
  const url = new URL(baseUrl);
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("page", String(page));
  return url.toString();
}
async function fetchShopifyProducts(productsJsonUrl, storeOrigin) {
  const origin = storeOrigin.replace(/\/$/, "");
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (let page = 1; page <= 40; page++) {
    const url = productsJsonPageUrl(productsJsonUrl, page);
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" }
    });
    if (!res.ok) {
      throw new Error(`Shopify fetch HTTP ${res.status}: ${url}`);
    }
    const data = await res.json();
    const products = data.products ?? [];
    if (products.length === 0) break;
    for (const product of products) {
      const handle = product.handle?.trim();
      if (!handle || seen.has(handle)) continue;
      seen.add(handle);
      out.push({
        key: handle,
        title: (product.title ?? handle).replace(/\s+/g, " ").trim(),
        url: `${origin}/products/${handle}`
      });
    }
    if (products.length < PAGE_SIZE) break;
  }
  return out;
}
export {
  fetchShopifyProducts
};
