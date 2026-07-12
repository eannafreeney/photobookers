import { err, ok, type Result } from "../../../lib/result";
import { toDateString } from "../../../lib/utils";
import {
  isTrendingInstagramRunDay,
  prepareTrendingInstagramPosts,
  queueTrendingInstagramPosts,
  runTrendingInstagramForEdition,
  type PrepareTrendingInstagramResult,
  type QueueTrendingInstagramResult,
} from "../trendingInstagram/services";

export type RunTrendingInstagramCronOptions = {
  dryRun?: boolean;
  force?: boolean;
  date?: Date;
  prepareOnly?: boolean;
  queueOnly?: boolean;
};

export type RunTrendingInstagramCronResult =
  | {
      action: "skipped";
      reason: "not_thursday";
    }
  | ({
      action: "ran";
    } & PrepareTrendingInstagramResult &
      Partial<QueueTrendingInstagramResult>);

export async function runTrendingInstagramCron(
  options: RunTrendingInstagramCronOptions = {},
): Promise<Result<RunTrendingInstagramCronResult, { reason: string }>> {
  if (!options.dryRun && !options.force && !isTrendingInstagramRunDay(options.date)) {
    return ok({ action: "skipped", reason: "not_thursday" });
  }

  const shared = {
    dryRun: options.dryRun,
    force: options.force,
    referenceDate: options.date,
  };

  if (options.prepareOnly) {
    const [error, prepared] = await prepareTrendingInstagramPosts(shared);
    if (error) return err(error);
    return ok({ action: "ran", ...prepared });
  }

  if (options.queueOnly) {
    const [error, queued] = await queueTrendingInstagramPosts(shared);
    if (error) return err(error);
    return ok({
      action: "ran",
      prepared: [],
      ...queued,
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
    queued: result.queued,
  });
}

export function formatTrendingInstagramCronSummary(
  result: RunTrendingInstagramCronResult,
): Record<string, unknown> {
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
      postId: entry.postId,
    })),
    skipped: result.skipped ?? [],
    ranOn: toDateString(new Date()),
  };
}
