import { and, desc, eq, isNotNull, isNull, lte, or } from "drizzle-orm";
import {
  CREATOR_CARD_COLUMNS,
  CREATOR_CARD_SELECT
} from "../../../constants/queries.js";
import { db } from "../../../db/client.js";
import {
  artistOfTheWeek,
  books,
  creatorInterviews,
  creators,
  publisherOfTheWeek
} from "../../../db/schema.js";
import { sendEmail } from "../../../lib/sendEmail.js";
import { err, ok } from "../../../lib/result.js";
import { toUtcStartOfDay, toWeekStart } from "../../../lib/utils.js";
import {
  buildAotwPublisherNotifyEmail,
  buildFeatureDayEmail,
  buildInterviewReminderEmail,
  spotlightUrlForType
} from "../../../features/dashboard/admin/planner/emails.js";
import { ensureInterviewInviteForSpotlight } from "../../../features/dashboard/admin/planner/interviewFlow.js";
function addUtcDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
function isInterviewComplete(status) {
  return status === "completed" || status === "published";
}
async function getLatestInterviewStatus(creatorId) {
  try {
    const interview = await db.query.creatorInterviews.findFirst({
      where: eq(creatorInterviews.creatorId, creatorId),
      orderBy: [desc(creatorInterviews.invitedAt)],
      columns: { status: true, inviteToken: true }
    });
    return ok(interview ?? null);
  } catch (error) {
    console.error("getLatestInterviewStatus", error);
    return err({
      reason: "Failed to get latest interview status",
      cause: error
    });
  }
}
async function loadArtistSpotlightsForWeek(weekStart) {
  try {
    const rows = await db.query.artistOfTheWeek.findMany({
      where: eq(artistOfTheWeek.weekStart, weekStart),
      with: { creator: { columns: CREATOR_CARD_COLUMNS } }
    });
    return ok(rows);
  } catch (error) {
    console.error("loadArtistSpotlightsForWeek", error);
    return err({
      reason: "Failed to load artist spotlights for week",
      cause: error
    });
  }
}
async function loadPublisherSpotlightsForWeek(weekStart) {
  try {
    const rows = await db.query.publisherOfTheWeek.findMany({
      where: eq(publisherOfTheWeek.weekStart, weekStart),
      with: { creator: { columns: CREATOR_CARD_COLUMNS } }
    });
    return ok(rows);
  } catch (error) {
    console.error("loadPublisherSpotlightsForWeek", error);
    return err({
      reason: "Failed to load publisher spotlights for week",
      cause: error
    });
  }
}
async function markInterviewReminderSent(type, weekStart) {
  try {
    const table = type === "artist" ? artistOfTheWeek : publisherOfTheWeek;
    await db.update(table).set({ interviewReminderSentAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(table.weekStart, weekStart));
    return ok(true);
  } catch (error) {
    return err({
      reason: "Failed to mark interview reminder sent",
      cause: error
    });
  }
}
async function markFeatureDayEmailSent(type, weekStart) {
  try {
    const table = type === "artist" ? artistOfTheWeek : publisherOfTheWeek;
    await db.update(table).set({ featureDayEmailSentAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(table.weekStart, weekStart));
    return ok(true);
  } catch (error) {
    return err({
      reason: "Failed to mark feature day email sent",
      cause: error
    });
  }
}
async function markRelatedNotifySent(type, weekStart) {
  try {
    const table = type === "artist" ? artistOfTheWeek : publisherOfTheWeek;
    await db.update(table).set({ relatedNotifySentAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(table.weekStart, weekStart));
    return ok(true);
  } catch (error) {
    return err({
      reason: "Failed to mark related creator notify sent",
      cause: error
    });
  }
}
async function getRelatedPublishersForArtist(artistId) {
  try {
    const related = await db.selectDistinct(CREATOR_CARD_SELECT).from(creators).innerJoin(books, eq(books.publisherId, creators.id)).where(
      and(
        eq(books.artistId, artistId),
        isNotNull(books.publisherId),
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
        or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
      )
    );
    return ok(related);
  } catch (error) {
    console.error("getRelatedPublishersForArtist", error);
    return err({ reason: "Failed to load related publishers", cause: error });
  }
}
async function resolveInterviewLink(params) {
  const [ensureError, ensureResult] = await ensureInterviewInviteForSpotlight({
    creatorId: params.creatorId,
    creatorSlug: params.creatorSlug,
    invitedByUserId: params.invitedByUserId,
    recipientEmail: params.recipientEmail
  });
  if (ensureError) return err(ensureError);
  return ok(ensureResult.interviewLink);
}
async function sendInterviewReminderForSpotlight(type, row, invitedByUserId) {
  if (!row.emailSentAt || row.interviewReminderSentAt) {
    return ok({
      status: "skipped",
      reason: "already_sent_or_no_initial_email"
    });
  }
  const email = row.creator.email?.trim();
  if (!email) return ok({ status: "skipped", reason: "no_email" });
  const [interviewError, interview] = await getLatestInterviewStatus(
    row.creatorId
  );
  if (interviewError) return err(interviewError);
  if (isInterviewComplete(interview?.status)) {
    return ok({ status: "skipped", reason: "interview_complete" });
  }
  const [linkError, link] = await resolveInterviewLink({
    creatorId: row.creator.id,
    creatorSlug: row.creator.slug,
    recipientEmail: email,
    invitedByUserId
  });
  if (linkError) return err(linkError);
  const html = buildInterviewReminderEmail({
    displayName: row.creator.displayName,
    type,
    weekStart: row.weekStart,
    interviewLink: link
  });
  const subject = type === "artist" ? "Reminder: Artist of the Week interview" : "Reminder: Publisher of the Week interview";
  const [emailError] = await sendEmail(email, subject, html);
  if (emailError) {
    return ok({ status: "failed", reason: emailError.reason });
  }
  const [markError] = await markInterviewReminderSent(type, row.weekStart);
  if (markError) return err(markError);
  return ok({ status: "sent" });
}
async function sendFeatureDayEmailForSpotlight(type, row, invitedByUserId) {
  if (row.featureDayEmailSentAt) {
    return ok({ status: "skipped", reason: "already_sent" });
  }
  const email = row.creator.email?.trim();
  if (!email) return ok({ status: "skipped", reason: "no_email" });
  const [interviewError, interview] = await getLatestInterviewStatus(
    row.creatorId
  );
  if (interviewError) return err(interviewError);
  let interviewLink = null;
  if (!isInterviewComplete(interview?.status)) {
    const [linkError, link] = await resolveInterviewLink({
      creatorId: row.creator.id,
      creatorSlug: row.creator.slug,
      recipientEmail: email,
      invitedByUserId
    });
    if (linkError) return err(linkError);
    interviewLink = link;
  } else if (interview?.inviteToken) {
    interviewLink = `${process.env.SITE_URL}/interviews/${interview.inviteToken}`;
  }
  const html = buildFeatureDayEmail({
    displayName: row.creator.displayName,
    type,
    weekStart: row.weekStart,
    spotlightUrl: spotlightUrlForType(type, row.weekStart),
    interviewLink,
    interviewStatus: interview?.status ?? null,
    instagram: row.creator.instagram
  });
  const subject = type === "artist" ? "You're live \u2014 Artist of the Week on Photobookers" : "You're live \u2014 Publisher of the Week on Photobookers";
  const [emailError] = await sendEmail(email, subject, html);
  if (emailError) {
    return ok({ status: "failed", reason: emailError.reason });
  }
  const [markError] = await markFeatureDayEmailSent(type, row.weekStart);
  if (markError) return err(markError);
  return ok({ status: "sent" });
}
async function recordRelatedPublisherNotifications(result, row) {
  if (!row.featureDayEmailSentAt || row.relatedNotifySentAt) {
    return ok(void 0);
  }
  const [relatedError, publishers] = await getRelatedPublishersForArtist(
    row.creatorId
  );
  if (relatedError) return err(relatedError);
  const spotlightUrl = spotlightUrlForType("artist", row.weekStart);
  const artistName = row.creator.displayName;
  for (const publisher of publishers) {
    if (publisher.id === row.creatorId) continue;
    const email = publisher.email?.trim();
    if (!email) {
      result.items.push({
        spotlight: "artist",
        kind: "related_notify",
        creatorId: publisher.id,
        featuredCreatorId: row.creatorId,
        weekStart: row.weekStart,
        outcome: { status: "skipped", reason: "no_email" }
      });
      continue;
    }
    const html = buildAotwPublisherNotifyEmail({
      publisherName: publisher.displayName,
      artistName,
      weekStart: row.weekStart,
      spotlightUrl
    });
    const subject = `${artistName} is Artist of the Week on Photobookers`;
    const [emailError] = await sendEmail(email, subject, html);
    const outcome = emailError ? { status: "failed", reason: emailError.reason } : { status: "sent" };
    result.items.push({
      spotlight: "artist",
      kind: "related_notify",
      creatorId: publisher.id,
      featuredCreatorId: row.creatorId,
      weekStart: row.weekStart,
      outcome
    });
    if (outcome.status === "sent") {
      result.relatedNotifySent++;
    }
  }
  const [markError] = await markRelatedNotifySent("artist", row.weekStart);
  if (markError) return err(markError);
  return ok(void 0);
}
async function recordSpotlightEmail(result, params) {
  const sendEmail2 = params.kind === "interview_reminder" ? () => sendInterviewReminderForSpotlight(
    params.spotlight,
    params.row,
    params.invitedByUserId
  ) : () => sendFeatureDayEmailForSpotlight(
    params.spotlight,
    params.row,
    params.invitedByUserId
  );
  const [sendError, outcome] = await sendEmail2();
  if (sendError) return err(sendError);
  result.items.push({
    spotlight: params.spotlight,
    kind: params.kind,
    creatorId: params.row.creatorId,
    weekStart: params.row.weekStart,
    outcome
  });
  if (outcome.status === "sent") {
    if (params.kind === "interview_reminder") {
      result.interviewRemindersSent++;
    } else {
      result.featureDayEmailsSent++;
      params.row.featureDayEmailSentAt = /* @__PURE__ */ new Date();
    }
  }
  return ok(void 0);
}
async function runSpotlightCreatorEmails(date = /* @__PURE__ */ new Date()) {
  const invitedByUserId = process.env.ADMIN_USER_ID;
  if (!invitedByUserId) {
    return err({ reason: "ADMIN_USER_ID is not set" });
  }
  const today = toUtcStartOfDay(date);
  const reminderWeekStart = addUtcDays(toWeekStart(today), 7);
  const featureWeekStart = toWeekStart(today);
  const [
    [artistReminderErr, artistReminders],
    [publisherReminderErr, publisherReminders],
    [artistFeatureErr, artistFeature],
    [publisherFeatureErr, publisherFeature]
  ] = await Promise.all([
    loadArtistSpotlightsForWeek(reminderWeekStart),
    loadPublisherSpotlightsForWeek(reminderWeekStart),
    loadArtistSpotlightsForWeek(featureWeekStart),
    loadPublisherSpotlightsForWeek(featureWeekStart)
  ]);
  if (artistReminderErr) return err(artistReminderErr);
  if (publisherReminderErr) return err(publisherReminderErr);
  if (artistFeatureErr) return err(artistFeatureErr);
  if (publisherFeatureErr) return err(publisherFeatureErr);
  const result = {
    interviewRemindersSent: 0,
    featureDayEmailsSent: 0,
    relatedNotifySent: 0,
    items: []
  };
  for (const row of artistReminders) {
    const [recordError] = await recordSpotlightEmail(result, {
      spotlight: "artist",
      kind: "interview_reminder",
      row,
      invitedByUserId
    });
    if (recordError) return err(recordError);
  }
  for (const row of publisherReminders) {
    const [recordError] = await recordSpotlightEmail(result, {
      spotlight: "publisher",
      kind: "interview_reminder",
      row,
      invitedByUserId
    });
    if (recordError) return err(recordError);
  }
  for (const row of artistFeature) {
    const [recordError] = await recordSpotlightEmail(result, {
      spotlight: "artist",
      kind: "feature_day",
      row,
      invitedByUserId
    });
    if (recordError) return err(recordError);
    const [relatedError] = await recordRelatedPublisherNotifications(
      result,
      row
    );
    if (relatedError) return err(relatedError);
  }
  for (const row of publisherFeature) {
    const [recordError] = await recordSpotlightEmail(result, {
      spotlight: "publisher",
      kind: "feature_day",
      row,
      invitedByUserId
    });
    if (recordError) return err(recordError);
  }
  return ok(result);
}
function manualSpotlightOutcomeToReason(outcome) {
  switch (outcome.reason) {
    case "already_sent":
      return "Email already sent";
    case "no_email":
      return "Creator has no email";
    case "already_sent_or_no_initial_email":
      return "Send the advance email first";
    case "interview_complete":
      return "Interview is already complete";
    default:
      return outcome.status === "failed" ? outcome.reason : "Email was not sent";
  }
}
async function sendManualSpotlightEmail(type, weekStart, kind, invitedByUserId) {
  const normalizedWeekStart = toWeekStart(weekStart);
  const [loadError, rows] = type === "artist" ? await loadArtistSpotlightsForWeek(normalizedWeekStart) : await loadPublisherSpotlightsForWeek(normalizedWeekStart);
  if (loadError) return err(loadError);
  const row = rows[0];
  if (!row) {
    return err({
      reason: type === "artist" ? "Artist of the week not found" : "Publisher of the week not found"
    });
  }
  const [sendError, outcome] = kind === "interview_reminder" ? await sendInterviewReminderForSpotlight(type, row, invitedByUserId) : await sendFeatureDayEmailForSpotlight(type, row, invitedByUserId);
  if (sendError) return err(sendError);
  if (outcome.status !== "sent") {
    return err({ reason: manualSpotlightOutcomeToReason(outcome) });
  }
  const {
    getArtistOfTheWeekForDateQuery,
    getPublisherOfTheWeekForDateQuery
  } = await import("../../../features/dashboard/admin/planner/services.js");
  return type === "artist" ? getArtistOfTheWeekForDateQuery(normalizedWeekStart) : getPublisherOfTheWeekForDateQuery(normalizedWeekStart);
}
export {
  runSpotlightCreatorEmails,
  sendManualSpotlightEmail
};
