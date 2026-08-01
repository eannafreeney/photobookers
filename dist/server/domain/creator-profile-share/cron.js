import { and, asc, count, eq, gte, isNotNull, isNull, lt } from "drizzle-orm";
import { db } from "../../db/client.js";
import { creators, users } from "../../db/schema.js";
import { sendEmail } from "../../lib/sendEmail.js";
import { err, ok } from "../../lib/result.js";
import { toUtcStartOfDay } from "../../lib/utils.js";
import {
  buildCreatorProfileShareEmail,
  creatorProfileShareEmailSubject
} from "./emails.js";
import { resolveCreatorProfileShareDailyLimit } from "./utils.js";
const SEND_DELAY_MS = 400;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function countProfileShareEmailsSentOnDate(date = /* @__PURE__ */ new Date()) {
  const dayStart = toUtcStartOfDay(date);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
  const [row] = await db.select({ value: count() }).from(creators).where(
    and(
      isNotNull(creators.profileShareEmailSentAt),
      gte(creators.profileShareEmailSentAt, dayStart),
      lt(creators.profileShareEmailSentAt, dayEnd)
    )
  );
  return Number(row?.value ?? 0);
}
async function loadEligibleCreatorsForProfileShare(creatorId) {
  try {
    const rows = await db.select({
      id: creators.id,
      displayName: creators.displayName,
      slug: creators.slug,
      type: creators.type,
      ownerEmail: users.email
    }).from(creators).innerJoin(users, eq(creators.ownerUserId, users.id)).where(
      and(
        eq(creators.status, "verified"),
        isNotNull(creators.verifiedAt),
        isNull(creators.profileShareEmailSentAt),
        creatorId ? eq(creators.id, creatorId) : void 0
      )
    ).orderBy(asc(creators.verifiedAt));
    return ok(
      rows.filter(
        (row) => (row.type === "artist" || row.type === "publisher") && row.ownerEmail.trim().length > 0
      )
    );
  } catch (error) {
    console.error("loadEligibleCreatorsForProfileShare", error);
    return err({
      reason: "Failed to load creators for profile share emails",
      cause: error
    });
  }
}
async function markProfileShareEmailSent(creatorId) {
  try {
    await db.update(creators).set({ profileShareEmailSentAt: /* @__PURE__ */ new Date() }).where(eq(creators.id, creatorId));
    return ok(true);
  } catch (error) {
    return err({
      reason: "Failed to mark creator profile share email sent",
      cause: error
    });
  }
}
async function runCreatorProfileShareCron(options = {}) {
  const runDate = options.date ?? /* @__PURE__ */ new Date();
  const targetingCreator = Boolean(options.creatorId?.trim());
  const dailyLimit = resolveCreatorProfileShareDailyLimit(options.dailyLimit);
  const [loadError, eligible] = await loadEligibleCreatorsForProfileShare(
    options.creatorId
  );
  if (loadError) return err(loadError);
  const result = {
    action: options.dryRun ? "dry_run" : "sent",
    sent: 0,
    skipped: 0,
    failed: 0,
    items: []
  };
  if (eligible.length === 0) {
    result.action = "skipped";
    return ok(result);
  }
  let remainingSlots = dailyLimit;
  if (!targetingCreator) {
    const sentToday = await countProfileShareEmailsSentOnDate(runDate);
    remainingSlots = Math.max(0, dailyLimit - sentToday);
    if (remainingSlots === 0) {
      result.action = "skipped";
      return ok(result);
    }
  }
  let sentThisRun = 0;
  for (const creator of eligible) {
    if (!targetingCreator && sentThisRun >= remainingSlots) break;
    const to = options.to?.trim() || creator.ownerEmail.trim();
    if (!to) {
      result.skipped++;
      result.items.push({
        id: creator.id,
        outcome: { status: "skipped", reason: "no_email" }
      });
      continue;
    }
    if (options.dryRun) {
      result.sent++;
      sentThisRun++;
      result.items.push({
        id: creator.id,
        outcome: { status: "dry_run", to }
      });
      continue;
    }
    const html = buildCreatorProfileShareEmail({
      displayName: creator.displayName,
      slug: creator.slug,
      type: creator.type
    });
    const [emailError] = await sendEmail(
      to,
      creatorProfileShareEmailSubject(),
      html
    );
    if (emailError) {
      result.failed++;
      result.items.push({
        id: creator.id,
        outcome: { status: "failed", reason: emailError.reason }
      });
      continue;
    }
    const [markError] = await markProfileShareEmailSent(creator.id);
    if (markError) return err(markError);
    result.sent++;
    sentThisRun++;
    result.items.push({
      id: creator.id,
      outcome: { status: "sent", to }
    });
    await sleep(SEND_DELAY_MS);
  }
  if (!options.dryRun && result.sent === 0 && result.failed === 0) {
    result.action = "skipped";
  }
  return ok(result);
}
export {
  countProfileShareEmailsSentOnDate,
  loadEligibleCreatorsForProfileShare,
  runCreatorProfileShareCron
};
