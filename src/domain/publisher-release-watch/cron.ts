import { sendAdminEmail } from "../../lib/sendEmail";
import { err, ok, type Result } from "../../lib/result";
import { diffPublisherProducts } from "./diff";
import {
  buildPublisherReleaseWatchEmail,
  publisherReleaseWatchEmailSubject,
  type PublisherNewReleases,
} from "./emails";
import { fetchHtmlListingProducts } from "./htmlListings";
import { getSeenProductKeys, insertSeenProducts } from "./services";
import { fetchShopifyProducts } from "./shopify";
import {
  PUBLISHER_RELEASE_WATCHLIST,
  type WatchedProduct,
  type WatchTarget,
} from "./watchlist";

type ServiceError = { reason: string; cause?: unknown };

export type PublisherReleaseWatchCronResult = {
  action: "sent" | "skipped_no_new" | "dry_run";
  publishersChecked: number;
  publishersFailed: number;
  publishersSeeded: number;
  newReleaseCount: number;
  failures: Array<{ publisherId: string; reason: string }>;
};

export type PublisherReleaseWatchCronOptions = {
  dryRun?: boolean;
};

async function fetchProductsForTarget(
  target: WatchTarget,
): Promise<WatchedProduct[]> {
  if (target.kind === "shopify") {
    return fetchShopifyProducts(target.productsJsonUrl, target.storeOrigin);
  }
  return fetchHtmlListingProducts(target.id, target.listingUrl);
}

export async function runPublisherReleaseWatchCron(
  options: PublisherReleaseWatchCronOptions = {},
): Promise<Result<PublisherReleaseWatchCronResult, ServiceError>> {
  const newGroups: PublisherNewReleases[] = [];
  const failures: Array<{ publisherId: string; reason: string }> = [];
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
          products: newProducts,
        });
        if (!options.dryRun) {
          await insertSeenProducts(target.id, newProducts);
        }
      }
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : String(cause);
      console.error(
        `[publisher-release-watch] ${target.id} failed:`,
        reason,
      );
      failures.push({ publisherId: target.id, reason });
    }

    // ponytail: cheap politeness so Shopify/CF don't 429 the whole list
    await new Promise((r) => setTimeout(r, 750));
  }

  const base = {
    publishersChecked: PUBLISHER_RELEASE_WATCHLIST.length,
    publishersFailed: failures.length,
    publishersSeeded,
    newReleaseCount,
    failures,
  };

  if (newGroups.length === 0) {
    return ok({ ...base, action: options.dryRun ? "dry_run" : "skipped_no_new" });
  }

  if (options.dryRun) {
    return ok({ ...base, action: "dry_run" });
  }

  const subject = publisherReleaseWatchEmailSubject(
    newReleaseCount,
    newGroups.length,
  );
  const html = buildPublisherReleaseWatchEmail(newGroups);
  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) {
    return err({ reason: emailError.reason, cause: emailError.cause });
  }

  return ok({ ...base, action: "sent" });
}
