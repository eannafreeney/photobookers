import { ArtistOfTheWeek, BookOfTheDay, PublisherOfTheWeek } from "../../../../db/schema";
import { normalizeStoredDate, toDateString, toWeekString } from "../../../../lib/utils";
import { type EmailStatusBadgeProps } from "./components/EmailStatusBadge";
import {
  getBotdAdvanceEmailScheduledDate,
  getBotdFeatureDayEmailScheduledDate,
  getSpotlightAdvanceEmailScheduledDate,
  getSpotlightFeatureDayEmailScheduledDate,
} from "./utils";

type BotdEmailKind = "advance" | "feature_day";
type SpotlightEmailKind = "advance" | "interview_reminder" | "feature_day";

type BotdEmailBadgeSource = Pick<
  BookOfTheDay,
  | "id"
  | "date"
  | "artistEmailSentAt"
  | "publisherEmailSentAt"
  | "artistFeatureDayEmailSentAt"
  | "publisherFeatureDayEmailSentAt"
> & {
  book: {
    id: string;
    artist?: { id: string; email: string | null } | null;
    publisher?: { id: string; email: string | null } | null;
  } | null;
};

export function buildBotdEmailBadgeProps(params: {
  bookOfTheDay: BotdEmailBadgeSource;
  recipientType: "artist" | "publisher";
  emailKind: BotdEmailKind;
}): EmailStatusBadgeProps {
  const { bookOfTheDay, recipientType, emailKind } = params;
  const book = bookOfTheDay.book;
  if (!book) {
    throw new Error("Book of the day is missing book data");
  }

  const creator =
    recipientType === "artist" ? book.artist : book.publisher;
  const featureDate = normalizeStoredDate(bookOfTheDay.date);
  const isAdvance = emailKind === "advance";
  const labelPrefix = recipientType === "artist" ? "Artist" : "Publisher";

  return {
    label: `${labelPrefix} ${isAdvance ? "advance" : "feature day"}`,
    sentAt: isAdvance
      ? recipientType === "artist"
        ? bookOfTheDay.artistEmailSentAt
        : bookOfTheDay.publisherEmailSentAt
      : recipientType === "artist"
        ? bookOfTheDay.artistFeatureDayEmailSentAt
        : bookOfTheDay.publisherFeatureDayEmailSentAt,
    scheduledDate: isAdvance
      ? getBotdAdvanceEmailScheduledDate(featureDate)
      : getBotdFeatureDayEmailScheduledDate(featureDate),
    hasEmail: Boolean(creator?.email?.trim()),
    targetId: `email-status-botd-${bookOfTheDay.id}-${recipientType}-${emailKind}`,
    manualSend: {
      action: "/dashboard/admin/planner/book-of-the-day/send-creator-email",
      fields: {
        creatorId: creator?.id ?? "",
        bookId: book.id,
        date: toDateString(featureDate),
        recipientType,
        emailKind,
      },
    },
  };
}

export function buildSpotlightEmailBadgeProps(params: {
  spotlight: "artist" | "publisher";
  row: Pick<
    ArtistOfTheWeek | PublisherOfTheWeek,
    | "id"
    | "weekStart"
    | "emailSentAt"
    | "interviewReminderSentAt"
    | "featureDayEmailSentAt"
  >;
  creatorId: string;
  email: string | null;
  emailKind: SpotlightEmailKind;
}): EmailStatusBadgeProps {
  const { spotlight, row, creatorId, email, emailKind } = params;
  const weekStart = normalizeStoredDate(row.weekStart);
  const labelPrefix = spotlight === "artist" ? "Artist" : "Publisher";
  const actionBase =
    spotlight === "artist"
      ? "/dashboard/admin/planner/artist-of-the-week/send-creator-email"
      : "/dashboard/admin/planner/publisher-of-the-week/send-creator-email";

  const labels: Record<SpotlightEmailKind, string> = {
    advance: `${labelPrefix} advance`,
    interview_reminder: `${labelPrefix} interview reminder`,
    feature_day: `${labelPrefix} feature day`,
  };

  const sentAtByKind: Record<SpotlightEmailKind, Date | null> = {
    advance: row.emailSentAt,
    interview_reminder: row.interviewReminderSentAt,
    feature_day: row.featureDayEmailSentAt,
  };

  const requiresAdvanceSent = emailKind === "interview_reminder";

  return {
    label: labels[emailKind],
    sentAt: sentAtByKind[emailKind],
    scheduledDate:
      emailKind === "feature_day"
        ? getSpotlightFeatureDayEmailScheduledDate(weekStart)
        : getSpotlightAdvanceEmailScheduledDate(weekStart),
    hasEmail: Boolean(email?.trim()),
    targetId: `email-status-${spotlight}-${row.id}-${emailKind}`,
    manualSend: {
      action: actionBase,
      fields: {
        creatorId,
        weekStart: toWeekString(weekStart),
        emailKind,
      },
      requiresAdvanceSent,
      advanceSent: Boolean(row.emailSentAt),
    },
  };
}
