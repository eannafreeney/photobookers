import { and, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { creatorInterviews, creators } from "../../db/schema.js";
import { sendEmail } from "../../lib/sendEmail.js";
import { err, ok } from "../../lib/result.js";
import { toUtcStartOfDay } from "../../lib/utils.js";
import {
  buildInterviewOpenReminderEmail,
  interviewOpenReminderSubject
} from "./emails.js";
import {
  pickInterviewsForReminder,
  REMINDER_INTERVAL_DAYS
} from "./reminderCronUtils.js";
const SEND_DELAY_MS = 400;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function addUtcDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
async function loadOpenInterviewsForReminder(options) {
  const runDate = options.date ?? /* @__PURE__ */ new Date();
  const reminderCutoff = addUtcDays(
    toUtcStartOfDay(runDate),
    -REMINDER_INTERVAL_DAYS
  );
  try {
    const rows = await db.select({
      id: creatorInterviews.id,
      creatorId: creatorInterviews.creatorId,
      creatorSlug: creatorInterviews.creatorSlug,
      recipientEmail: creatorInterviews.recipientEmail,
      inviteToken: creatorInterviews.inviteToken,
      invitedAt: creatorInterviews.invitedAt,
      reminderSentAt: creatorInterviews.reminderSentAt,
      creatorDisplayName: creators.displayName
    }).from(creatorInterviews).innerJoin(creators, eq(creatorInterviews.creatorId, creators.id)).where(
      and(
        eq(creatorInterviews.status, "sent"),
        isNull(creators.interviewReminderOptOutAt),
        options.creatorId ? eq(creatorInterviews.creatorId, options.creatorId) : void 0,
        options.force ? void 0 : lte(
          sql`coalesce(${creatorInterviews.reminderSentAt}, ${creatorInterviews.invitedAt})`,
          reminderCutoff
        ),
        or(
          isNull(creatorInterviews.expiresAt),
          gte(creatorInterviews.expiresAt, runDate)
        )
      )
    );
    return ok(pickInterviewsForReminder(rows));
  } catch (error) {
    console.error("loadOpenInterviewsForReminder", error);
    return err({
      reason: "Failed to load open interviews for reminder",
      cause: error
    });
  }
}
async function markReminderSent(interviewId) {
  try {
    await db.update(creatorInterviews).set({ reminderSentAt: /* @__PURE__ */ new Date() }).where(eq(creatorInterviews.id, interviewId));
    return ok(true);
  } catch (error) {
    return err({ reason: "Failed to mark interview reminder sent", cause: error });
  }
}
async function runInterviewReminderCron(options = {}) {
  const [loadError, interviews] = await loadOpenInterviewsForReminder(options);
  if (loadError) return err(loadError);
  const result = {
    action: options.dryRun ? "dry_run" : "sent",
    sent: 0,
    skipped: 0,
    failed: 0,
    items: []
  };
  if (interviews.length === 0) {
    result.action = "skipped";
    return ok(result);
  }
  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  for (const interview of interviews) {
    const to = options.to?.trim() || interview.recipientEmail.trim() || "";
    if (!to) {
      result.skipped++;
      result.items.push({
        creatorId: interview.creatorId,
        interviewId: interview.id,
        outcome: { status: "skipped", reason: "no_email" }
      });
      continue;
    }
    if (options.dryRun) {
      result.sent++;
      result.items.push({
        creatorId: interview.creatorId,
        interviewId: interview.id,
        outcome: { status: "dry_run", to, interviewId: interview.id }
      });
      continue;
    }
    const interviewLink = `${siteUrl}/interviews/${interview.inviteToken}`;
    const profileUrl = `https://photobookers.com/creators/${interview.creatorSlug}`;
    const optOutUrl = `${siteUrl}/interviews/${interview.inviteToken}/opt-out-reminders`;
    const html = buildInterviewOpenReminderEmail({
      creatorName: interview.creatorDisplayName,
      interviewLink,
      profileUrl,
      optOutUrl
    });
    const subject = interviewOpenReminderSubject(interview.creatorDisplayName);
    const [emailError] = await sendEmail(to, subject, html);
    if (emailError) {
      result.failed++;
      result.items.push({
        creatorId: interview.creatorId,
        interviewId: interview.id,
        outcome: {
          status: "failed",
          reason: emailError.reason,
          interviewId: interview.id
        }
      });
      continue;
    }
    const [markError] = await markReminderSent(interview.id);
    if (markError) return err(markError);
    result.sent++;
    result.items.push({
      creatorId: interview.creatorId,
      interviewId: interview.id,
      outcome: { status: "sent", to, interviewId: interview.id }
    });
    await sleep(SEND_DELAY_MS);
  }
  if (!options.dryRun && result.sent === 0 && result.failed === 0) {
    result.action = "skipped";
  }
  return ok(result);
}
export {
  loadOpenInterviewsForReminder,
  runInterviewReminderCron
};
