import { sendAdminEmail } from "../../lib/sendEmail.js";
import { err, ok } from "../../lib/result.js";
import { diffPublisherProducts } from "./diff.js";
import {
  buildPublisherReleaseWatchEmail,
  publisherReleaseWatchEmailSubject
} from "./emails.js";
import { fetchHtmlListingProducts } from "./htmlListings.js";
import { getSeenProductKeys, insertSeenProducts } from "./services.js";
import { fetchShopifyProducts } from "./shopify.js";
import {
  PUBLISHER_RELEASE_WATCHLIST
} from "./watchlist.js";
async function fetchProductsForTarget(target) {
  if (target.kind === "shopify") {
    return fetchShopifyProducts(target.productsJsonUrl, target.storeOrigin);
  }
  return fetchHtmlListingProducts(target.id, target.listingUrl);
}
async function runPublisherReleaseWatchCron(options = {}) {
  const newGroups = [];
  const failures = [];
  let publishersSeeded = 0;
  let newReleaseCount = 0;
  for (const target of PUBLISHER_RELEASE_WATCHLIST) {
    try {
      const products = await fetchProductsForTarget(target);
      const seenKeys = await getSeenProductKeys(target.id);
      const { seeded, newProducts } = diffPublisherProducts(products, seenKeys);
      if (seeded) {
        publishersSeeded += 1;
        if (!options.dryRun) {
          await insertSeenProducts(target.id, products);
        }
        continue;
      }
      if (newProducts.length > 0) {
        newReleaseCount += newProducts.length;
        newGroups.push({
          publisherId: target.id,
          publisherName: target.name,
          products: newProducts
        });
        if (!options.dryRun) {
          await insertSeenProducts(target.id, newProducts);
        }
      }
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : String(cause);
      console.error(
        `[publisher-release-watch] ${target.id} failed:`,
        reason
      );
      failures.push({ publisherId: target.id, reason });
    }
    await new Promise((r) => setTimeout(r, 750));
  }
  const base = {
    publishersChecked: PUBLISHER_RELEASE_WATCHLIST.length,
    publishersFailed: failures.length,
    publishersSeeded,
    newReleaseCount,
    failures
  };
  if (newGroups.length === 0) {
    return ok({ ...base, action: options.dryRun ? "dry_run" : "skipped_no_new" });
  }
  if (options.dryRun) {
    return ok({ ...base, action: "dry_run" });
  }
  const subject = publisherReleaseWatchEmailSubject(
    newReleaseCount,
    newGroups.length
  );
  const html = buildPublisherReleaseWatchEmail(newGroups);
  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) {
    return err({ reason: emailError.reason, cause: emailError.cause });
  }
  return ok({ ...base, action: "sent" });
}
export {
  runPublisherReleaseWatchCron
};
