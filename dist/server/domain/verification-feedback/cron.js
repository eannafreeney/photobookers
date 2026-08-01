import { and, eq, isNotNull, isNull, lte, notExists } from "drizzle-orm";
import { db } from "../../db/client.js";
import { creators, users } from "../../db/schema.js";
import { sendEmail } from "../../lib/sendEmail.js";
import { err, ok } from "../../lib/result.js";
import { getVerificationFeedbackEligibleBefore } from "./utils.js";
import { buildFeedbackRequestEmail } from "./emails.js";
import { VERIFICATION_FEEDBACK_DELAY_DAYS } from "./utils.js";
const SEND_DELAY_MS = 400;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function loadEligibleFansForFeedback(options) {
  const runDate = options.date ?? /* @__PURE__ */ new Date();
  const eligibleBefore = getVerificationFeedbackEligibleBefore(runDate);
  try {
    const rows = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      createdAt: users.createdAt
    }).from(users).where(
      and(
        eq(users.isAdmin, false),
        eq(users.mustResetPassword, false),
        isNull(users.verificationFeedbackEmailSentAt),
        options.userId ? eq(users.id, options.userId) : void 0,
        options.force ? void 0 : lte(users.createdAt, eligibleBefore),
        notExists(
          db.select({ id: creators.id }).from(creators).where(
            and(
              eq(creators.ownerUserId, users.id),
              eq(creators.status, "verified")
            )
          )
        )
      )
    );
    return ok(rows);
  } catch (error) {
    console.error("loadEligibleFansForFeedback", error);
    return err({
      reason: "Failed to load fans for verification feedback",
      cause: error
    });
  }
}
async function loadEligibleCreatorsForFeedback(options) {
  const runDate = options.date ?? /* @__PURE__ */ new Date();
  const eligibleBefore = getVerificationFeedbackEligibleBefore(runDate);
  try {
    const rows = await db.select({
      id: creators.id,
      displayName: creators.displayName,
      slug: creators.slug,
      verifiedAt: creators.verifiedAt,
      ownerEmail: users.email
    }).from(creators).innerJoin(users, eq(creators.ownerUserId, users.id)).where(
      and(
        eq(creators.status, "verified"),
        isNotNull(creators.verifiedAt),
        isNull(creators.verificationFeedbackEmailSentAt),
        options.creatorId ? eq(creators.id, options.creatorId) : void 0,
        options.force ? void 0 : lte(creators.verifiedAt, eligibleBefore)
      )
    );
    return ok(
      rows.filter(
        (row) => row.verifiedAt != null && row.ownerEmail.trim().length > 0
      )
    );
  } catch (error) {
    console.error("loadEligibleCreatorsForFeedback", error);
    return err({
      reason: "Failed to load creators for verification feedback",
      cause: error
    });
  }
}
async function markFanFeedbackSent(userId) {
  try {
    await db.update(users).set({ verificationFeedbackEmailSentAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
    return ok(true);
  } catch (error) {
    return err({
      reason: "Failed to mark fan verification feedback sent",
      cause: error
    });
  }
}
async function markCreatorFeedbackSent(creatorId) {
  try {
    await db.update(creators).set({ verificationFeedbackEmailSentAt: /* @__PURE__ */ new Date() }).where(eq(creators.id, creatorId));
    return ok(true);
  } catch (error) {
    return err({
      reason: "Failed to mark creator verification feedback sent",
      cause: error
    });
  }
}
async function runVerificationFeedbackCron(options = {}) {
  const [fanError, fans] = await loadEligibleFansForFeedback(options);
  if (fanError) return err(fanError);
  const [creatorError, creatorRows] = await loadEligibleCreatorsForFeedback(options);
  if (creatorError) return err(creatorError);
  const result = {
    action: options.dryRun ? "dry_run" : "sent",
    sent: 0,
    skipped: 0,
    failed: 0,
    items: []
  };
  if (fans.length === 0 && creatorRows.length === 0) {
    result.action = "skipped";
    return ok(result);
  }
  for (const fan of fans) {
    const to = options.to?.trim() || fan.email.trim();
    if (!to) {
      result.skipped++;
      result.items.push({
        id: fan.id,
        kind: "fan",
        outcome: { status: "skipped", reason: "no_email", kind: "fan" }
      });
      continue;
    }
    if (options.dryRun) {
      result.sent++;
      result.items.push({
        id: fan.id,
        kind: "fan",
        outcome: { status: "dry_run", to, kind: "fan" }
      });
      continue;
    }
    const html = buildFeedbackRequestEmail({
      name: fan.firstName ?? "there",
      kind: "fan"
    });
    const [emailError] = await sendEmail(to, "Quick check-in", html);
    if (emailError) {
      result.failed++;
      result.items.push({
        id: fan.id,
        kind: "fan",
        outcome: {
          status: "failed",
          reason: emailError.reason,
          kind: "fan"
        }
      });
      continue;
    }
    const [markError] = await markFanFeedbackSent(fan.id);
    if (markError) return err(markError);
    result.sent++;
    result.items.push({
      id: fan.id,
      kind: "fan",
      outcome: { status: "sent", to, kind: "fan" }
    });
    await sleep(SEND_DELAY_MS);
  }
  for (const creator of creatorRows) {
    const to = options.to?.trim() || creator.ownerEmail.trim();
    if (!to) {
      result.skipped++;
      result.items.push({
        id: creator.id,
        kind: "creator",
        outcome: { status: "skipped", reason: "no_email", kind: "creator" }
      });
      continue;
    }
    if (options.dryRun) {
      result.sent++;
      result.items.push({
        id: creator.id,
        kind: "creator",
        outcome: { status: "dry_run", to, kind: "creator" }
      });
      continue;
    }
    const html = buildFeedbackRequestEmail({
      name: creator.displayName,
      kind: "creator"
    });
    const [emailError] = await sendEmail(
      to,
      "Quick check-in on your Photobookers profile",
      html
    );
    if (emailError) {
      result.failed++;
      result.items.push({
        id: creator.id,
        kind: "creator",
        outcome: {
          status: "failed",
          reason: emailError.reason,
          kind: "creator"
        }
      });
      continue;
    }
    const [markError] = await markCreatorFeedbackSent(creator.id);
    if (markError) return err(markError);
    result.sent++;
    result.items.push({
      id: creator.id,
      kind: "creator",
      outcome: { status: "sent", to, kind: "creator" }
    });
    await sleep(SEND_DELAY_MS);
  }
  if (!options.dryRun && result.sent === 0 && result.failed === 0) {
    result.action = "skipped";
  }
  return ok(result);
}
export {
  VERIFICATION_FEEDBACK_DELAY_DAYS,
  loadEligibleCreatorsForFeedback,
  loadEligibleFansForFeedback,
  runVerificationFeedbackCron
};
