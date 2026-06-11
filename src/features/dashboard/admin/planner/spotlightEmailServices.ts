import { and, desc, eq, isNotNull, isNull, lte, or } from "drizzle-orm";
import {
  CREATOR_CARD_COLUMNS,
  CREATOR_CARD_SELECT,
  type CreatorCardResult,
} from "../../../../constants/queries";
import { db } from "../../../../db/client";
import {
  artistOfTheWeek,
  books,
  creatorInterviews,
  creators,
  publisherOfTheWeek,
  type CreatorInterviewStatus,
} from "../../../../db/schema";
import { sendEmail } from "../../../../lib/sendEmail";
import { err, ok, type Result } from "../../../../lib/result";
import { toUtcStartOfDay, toWeekStart } from "../../../../lib/utils";
import {
  buildAotwPublisherNotifyEmail,
  buildFeatureDayEmail,
  buildInterviewReminderEmail,
  spotlightUrlForType,
} from "./emails";
import { ensureInterviewInviteForSpotlight } from "./interviewFlow";

type SpotlightType = "artist" | "publisher";

type SpotlightServiceError = { reason: string; cause?: unknown };

export type SpotlightEmailSkipReason =
  | "already_sent_or_no_initial_email"
  | "interview_complete"
  | "no_email"
  | "already_sent";

export type SpotlightEmailItemOutcome =
  | { status: "sent" }
  | { status: "skipped"; reason: SpotlightEmailSkipReason }
  | { status: "failed"; reason: string };

export type SpotlightEmailItemKind =
  | "interview_reminder"
  | "feature_day"
  | "related_notify";

export type SpotlightEmailRunResult = {
  interviewRemindersSent: number;
  featureDayEmailsSent: number;
  relatedNotifySent: number;
  items: Array<{
    spotlight: SpotlightType;
    kind: SpotlightEmailItemKind;
    creatorId: string;
    weekStart: Date;
    featuredCreatorId?: string;
    outcome: SpotlightEmailItemOutcome;
  }>;
};

export type RunSpotlightCreatorEmailsResult = Result<
  SpotlightEmailRunResult,
  SpotlightServiceError
>;

type SpotlightWithCreator = {
  id: string;
  weekStart: Date;
  creatorId: string;
  emailSentAt: Date | null;
  interviewReminderSentAt: Date | null;
  featureDayEmailSentAt: Date | null;
  relatedNotifySentAt: Date | null;
  creator: CreatorCardResult;
};

type LatestInterview = {
  status: CreatorInterviewStatus;
  inviteToken: string;
} | null;

function addUtcDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function isInterviewComplete(
  status: CreatorInterviewStatus | null | undefined,
) {
  return status === "completed" || status === "published";
}

async function getLatestInterviewStatus(
  creatorId: string,
): Promise<Result<LatestInterview, SpotlightServiceError>> {
  try {
    const interview = await db.query.creatorInterviews.findFirst({
      where: eq(creatorInterviews.creatorId, creatorId),
      orderBy: [desc(creatorInterviews.invitedAt)],
      columns: { status: true, inviteToken: true },
    });
    return ok(interview ?? null);
  } catch (error) {
    console.error("getLatestInterviewStatus", error);
    return err({
      reason: "Failed to get latest interview status",
      cause: error,
    });
  }
}

async function loadArtistSpotlightsForWeek(
  weekStart: Date,
): Promise<Result<SpotlightWithCreator[], SpotlightServiceError>> {
  try {
    const rows = await db.query.artistOfTheWeek.findMany({
      where: eq(artistOfTheWeek.weekStart, weekStart),
      with: { creator: { columns: CREATOR_CARD_COLUMNS } },
    });
    return ok(rows);
  } catch (error) {
    console.error("loadArtistSpotlightsForWeek", error);
    return err({
      reason: "Failed to load artist spotlights for week",
      cause: error,
    });
  }
}

async function loadPublisherSpotlightsForWeek(
  weekStart: Date,
): Promise<Result<SpotlightWithCreator[], SpotlightServiceError>> {
  try {
    const rows = await db.query.publisherOfTheWeek.findMany({
      where: eq(publisherOfTheWeek.weekStart, weekStart),
      with: { creator: { columns: CREATOR_CARD_COLUMNS } },
    });
    return ok(rows);
  } catch (error) {
    console.error("loadPublisherSpotlightsForWeek", error);
    return err({
      reason: "Failed to load publisher spotlights for week",
      cause: error,
    });
  }
}

async function markInterviewReminderSent(
  type: SpotlightType,
  weekStart: Date,
): Promise<Result<true, SpotlightServiceError>> {
  try {
    const table = type === "artist" ? artistOfTheWeek : publisherOfTheWeek;
    await db
      .update(table)
      .set({ interviewReminderSentAt: new Date(), updatedAt: new Date() })
      .where(eq(table.weekStart, weekStart));
    return ok(true);
  } catch (error) {
    return err({
      reason: "Failed to mark interview reminder sent",
      cause: error,
    });
  }
}

async function markFeatureDayEmailSent(
  type: SpotlightType,
  weekStart: Date,
): Promise<Result<true, SpotlightServiceError>> {
  try {
    const table = type === "artist" ? artistOfTheWeek : publisherOfTheWeek;
    await db
      .update(table)
      .set({ featureDayEmailSentAt: new Date(), updatedAt: new Date() })
      .where(eq(table.weekStart, weekStart));
    return ok(true);
  } catch (error) {
    return err({
      reason: "Failed to mark feature day email sent",
      cause: error,
    });
  }
}

async function markRelatedNotifySent(
  type: SpotlightType,
  weekStart: Date,
): Promise<Result<true, SpotlightServiceError>> {
  try {
    const table = type === "artist" ? artistOfTheWeek : publisherOfTheWeek;
    await db
      .update(table)
      .set({ relatedNotifySentAt: new Date(), updatedAt: new Date() })
      .where(eq(table.weekStart, weekStart));
    return ok(true);
  } catch (error) {
    return err({
      reason: "Failed to mark related creator notify sent",
      cause: error,
    });
  }
}

async function getRelatedPublishersForArtist(
  artistId: string,
): Promise<Result<CreatorCardResult[], SpotlightServiceError>> {
  try {
    const related = await db
      .selectDistinct(CREATOR_CARD_SELECT)
      .from(creators)
      .innerJoin(books, eq(books.publisherId, creators.id))
      .where(
        and(
          eq(books.artistId, artistId),
          isNotNull(books.publisherId),
          eq(books.publicationStatus, "published"),
          eq(books.approvalStatus, "approved"),
          or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
        ),
      );
    return ok(related);
  } catch (error) {
    console.error("getRelatedPublishersForArtist", error);
    return err({ reason: "Failed to load related publishers", cause: error });
  }
}

async function resolveInterviewLink(params: {
  creatorId: string;
  creatorSlug: string;
  recipientEmail: string;
  invitedByUserId: string;
}): Promise<Result<string | null, SpotlightServiceError>> {
  const [ensureError, ensureResult] = await ensureInterviewInviteForSpotlight({
    creatorId: params.creatorId,
    creatorSlug: params.creatorSlug,
    invitedByUserId: params.invitedByUserId,
    recipientEmail: params.recipientEmail,
  });
  if (ensureError) return err(ensureError);
  return ok(ensureResult.interviewLink);
}

async function sendInterviewReminderForSpotlight(
  type: SpotlightType,
  row: SpotlightWithCreator,
  invitedByUserId: string,
): Promise<Result<SpotlightEmailItemOutcome, SpotlightServiceError>> {
  if (!row.emailSentAt || row.interviewReminderSentAt) {
    return ok({
      status: "skipped",
      reason: "already_sent_or_no_initial_email",
    });
  }

  const email = row.creator.email?.trim();
  if (!email) return ok({ status: "skipped", reason: "no_email" });

  const [interviewError, interview] = await getLatestInterviewStatus(
    row.creatorId,
  );
  if (interviewError) return err(interviewError);

  if (isInterviewComplete(interview?.status)) {
    return ok({ status: "skipped", reason: "interview_complete" });
  }

  const [linkError, link] = await resolveInterviewLink({
    creatorId: row.creator.id,
    creatorSlug: row.creator.slug,
    recipientEmail: email,
    invitedByUserId,
  });
  if (linkError) return err(linkError);

  const html = buildInterviewReminderEmail({
    displayName: row.creator.displayName,
    type,
    weekStart: row.weekStart,
    interviewLink: link,
  });

  const subject =
    type === "artist"
      ? "Reminder: Artist of the Week interview"
      : "Reminder: Publisher of the Week interview";

  const [emailError] = await sendEmail(email, subject, html);
  if (emailError) {
    return ok({ status: "failed", reason: emailError.reason });
  }

  const [markError] = await markInterviewReminderSent(type, row.weekStart);
  if (markError) return err(markError);

  return ok({ status: "sent" });
}

async function sendFeatureDayEmailForSpotlight(
  type: SpotlightType,
  row: SpotlightWithCreator,
  invitedByUserId: string,
): Promise<Result<SpotlightEmailItemOutcome, SpotlightServiceError>> {
  if (row.featureDayEmailSentAt) {
    return ok({ status: "skipped", reason: "already_sent" });
  }

  const email = row.creator.email?.trim();
  if (!email) return ok({ status: "skipped", reason: "no_email" });

  const [interviewError, interview] = await getLatestInterviewStatus(
    row.creatorId,
  );
  if (interviewError) return err(interviewError);

  let interviewLink: string | null = null;

  if (!isInterviewComplete(interview?.status)) {
    const [linkError, link] = await resolveInterviewLink({
      creatorId: row.creator.id,
      creatorSlug: row.creator.slug,
      recipientEmail: email,
      invitedByUserId,
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
    instagram: row.creator.instagram,
  });

  const subject =
    type === "artist"
      ? "You're live — Artist of the Week on Photobookers"
      : "You're live — Publisher of the Week on Photobookers";

  const [emailError] = await sendEmail(email, subject, html);
  if (emailError) {
    return ok({ status: "failed", reason: emailError.reason });
  }

  const [markError] = await markFeatureDayEmailSent(type, row.weekStart);
  if (markError) return err(markError);

  return ok({ status: "sent" });
}

async function recordRelatedPublisherNotifications(
  result: SpotlightEmailRunResult,
  row: SpotlightWithCreator,
): Promise<Result<void, SpotlightServiceError>> {
  if (!row.featureDayEmailSentAt || row.relatedNotifySentAt) {
    return ok(undefined);
  }

  const [relatedError, publishers] = await getRelatedPublishersForArtist(
    row.creatorId,
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
        outcome: { status: "skipped", reason: "no_email" },
      });
      continue;
    }

    const html = buildAotwPublisherNotifyEmail({
      publisherName: publisher.displayName,
      artistName,
      weekStart: row.weekStart,
      spotlightUrl,
    });

    const subject = `${artistName} is Artist of the Week on Photobookers`;

    const [emailError] = await sendEmail(email, subject, html);
    const outcome: SpotlightEmailItemOutcome = emailError
      ? { status: "failed", reason: emailError.reason }
      : { status: "sent" };

    result.items.push({
      spotlight: "artist",
      kind: "related_notify",
      creatorId: publisher.id,
      featuredCreatorId: row.creatorId,
      weekStart: row.weekStart,
      outcome,
    });

    if (outcome.status === "sent") {
      result.relatedNotifySent++;
    }
  }

  const [markError] = await markRelatedNotifySent("artist", row.weekStart);
  if (markError) return err(markError);

  return ok(undefined);
}

async function recordSpotlightEmail(
  result: SpotlightEmailRunResult,
  params: {
    spotlight: SpotlightType;
    kind: "interview_reminder" | "feature_day";
    row: SpotlightWithCreator;
    invitedByUserId: string;
  },
): Promise<Result<void, SpotlightServiceError>> {
  const sendEmail =
    params.kind === "interview_reminder"
      ? () =>
          sendInterviewReminderForSpotlight(
            params.spotlight,
            params.row,
            params.invitedByUserId,
          )
      : () =>
          sendFeatureDayEmailForSpotlight(
            params.spotlight,
            params.row,
            params.invitedByUserId,
          );

  const [sendError, outcome] = await sendEmail();
  if (sendError) return err(sendError);

  result.items.push({
    spotlight: params.spotlight,
    kind: params.kind,
    creatorId: params.row.creatorId,
    weekStart: params.row.weekStart,
    outcome,
  });

  if (outcome.status === "sent") {
    if (params.kind === "interview_reminder") {
      result.interviewRemindersSent++;
    } else {
      result.featureDayEmailsSent++;
      params.row.featureDayEmailSentAt = new Date();
    }
  }

  return ok(undefined);
}

export async function runSpotlightCreatorEmails(
  date: Date = new Date(),
): Promise<RunSpotlightCreatorEmailsResult> {
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
    [publisherFeatureErr, publisherFeature],
  ] = await Promise.all([
    loadArtistSpotlightsForWeek(reminderWeekStart),
    loadPublisherSpotlightsForWeek(reminderWeekStart),
    loadArtistSpotlightsForWeek(featureWeekStart),
    loadPublisherSpotlightsForWeek(featureWeekStart),
  ]);

  if (artistReminderErr) return err(artistReminderErr);
  if (publisherReminderErr) return err(publisherReminderErr);
  if (artistFeatureErr) return err(artistFeatureErr);
  if (publisherFeatureErr) return err(publisherFeatureErr);

  const result: SpotlightEmailRunResult = {
    interviewRemindersSent: 0,
    featureDayEmailsSent: 0,
    relatedNotifySent: 0,
    items: [],
  };

  for (const row of artistReminders) {
    const [recordError] = await recordSpotlightEmail(result, {
      spotlight: "artist",
      kind: "interview_reminder",
      row,
      invitedByUserId,
    });
    if (recordError) return err(recordError);
  }

  for (const row of publisherReminders) {
    const [recordError] = await recordSpotlightEmail(result, {
      spotlight: "publisher",
      kind: "interview_reminder",
      row,
      invitedByUserId,
    });
    if (recordError) return err(recordError);
  }

  for (const row of artistFeature) {
    const [recordError] = await recordSpotlightEmail(result, {
      spotlight: "artist",
      kind: "feature_day",
      row,
      invitedByUserId,
    });
    if (recordError) return err(recordError);

    const [relatedError] = await recordRelatedPublisherNotifications(
      result,
      row,
    );
    if (relatedError) return err(relatedError);
  }

  for (const row of publisherFeature) {
    const [recordError] = await recordSpotlightEmail(result, {
      spotlight: "publisher",
      kind: "feature_day",
      row,
      invitedByUserId,
    });
    if (recordError) return err(recordError);
  }

  return ok(result);
}
