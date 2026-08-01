import { err, ok } from "../../../lib/result.js";
import { toDateString } from "../../../lib/utils.js";
import {
  isTrendingInstagramRunDay,
  prepareTrendingInstagramPosts,
  queueTrendingInstagramPosts,
  runTrendingInstagramForEdition
} from "../trendingInstagram/services.js";
async function runTrendingInstagramCron(options = {}) {
  if (!options.dryRun && !options.force && !isTrendingInstagramRunDay(options.date)) {
    return ok({ action: "skipped", reason: "not_wednesday" });
  }
  const shared = {
    dryRun: options.dryRun,
    force: options.force,
    referenceDate: options.date
  };
  if (options.prepareOnly) {
    const [error2, prepared] = await prepareTrendingInstagramPosts(shared);
    if (error2) return err(error2);
    return ok({ action: "ran", ...prepared });
  }
  if (options.queueOnly) {
    const [error2, queued] = await queueTrendingInstagramPosts(shared);
    if (error2) return err(error2);
    return ok({
      action: "ran",
      prepared: [],
      ...queued
    });
  }
  const [error, result] = await runTrendingInstagramForEdition(shared);
  if (error) return err(error);
  return ok({
    action: "ran",
    campaignId: result.campaignId,
    editionWeekStart: result.editionWeekStart,
    prepared: result.prepared,
    skipped: [...result.skipped],
    queued: result.queued
  });
}
function formatTrendingInstagramCronSummary(result) {
  if (result.action === "skipped") {
    return { action: result.action, reason: result.reason };
  }
  return {
    action: result.action,
    campaignId: result.campaignId,
    editionWeekStart: result.editionWeekStart,
    prepared: result.prepared ?? [],
    queued: result.queued?.map((entry) => ({
      kind: entry.kind,
      postId: entry.postId
    })),
    skipped: result.skipped ?? [],
    ranOn: toDateString(/* @__PURE__ */ new Date())
  };
}
export {
  formatTrendingInstagramCronSummary,
  runTrendingInstagramCron
};
