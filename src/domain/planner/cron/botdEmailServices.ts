import { eq } from "drizzle-orm";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
  type BookCardResult,
  type CreatorCardResult,
} from "../../../constants/queries";
import { db } from "../../../db/client";
import { bookOfTheDay } from "../../../db/schema";
import { sendEmail } from "../../../lib/sendEmail";
import { err, ok, type Result } from "../../../lib/result";
import { toUtcStartOfDay } from "../../../lib/utils";
import { botdUrl } from "../../../features/app/spotlightUrls";
import { provisionCreatorUserAccount } from "../../../features/dashboard/admin/users/provisionCreatorAccount";
import {
  buildBotdFeatureDayEmail,
  generateBOTDNotificationEmail,
  type BotdNotificationAccountCredentials,
} from "../../../features/dashboard/admin/planner/emails";
import { updateBookOfTheDayByDate } from "../../../features/dashboard/admin/planner/services";
import { formatBotdDateLong } from "../../../features/dashboard/admin/planner/utils";

const CREATOR_BOTD_EMAIL_COLUMNS = {
  ...CREATOR_CARD_COLUMNS,
  ownerUserId: true,
} as const;

type BotdEmailServiceError = { reason: string; cause?: unknown };

export type BotdAdvanceNotificationCreator = {
  id: string;
  displayName: string;
  slug: string;
  email: string | null;
  ownerUserId: string | null;
};

export async function prepareBotdAdvanceNotificationContent(params: {
  creator: BotdAdvanceNotificationCreator;
  book: { id: string; title: string; slug: string };
  date: Date;
}) {
  const email = params.creator.email?.trim();
  let ownerUserId = params.creator.ownerUserId ?? null;
  let accountCredentials: BotdNotificationAccountCredentials | undefined;

  if (!ownerUserId && email) {
    const [provisionError, provision] = await provisionCreatorUserAccount({
      creatorId: params.creator.id,
      email,
      displayName: params.creator.displayName,
    });
    if (provisionError) {
      console.error(
        "prepareBotdAdvanceNotificationContent provision",
        provisionError,
      );
    } else if (provision.status === "created") {
      ownerUserId = provision.ownerUserId;
      accountCredentials = {
        kind: "created",
        email: provision.email,
        temporaryPassword: provision.temporaryPassword,
        loginUrl: provision.loginUrl,
      };
    } else if (provision.status === "linked_existing") {
      ownerUserId = provision.ownerUserId;
      accountCredentials = {
        kind: "linked",
        email: provision.email,
        loginUrl: provision.loginUrl,
      };
    } else if (provision.status === "failed") {
      console.error(
        "prepareBotdAdvanceNotificationContent provision failed",
        provision.reason,
      );
    }
  }

  const html = generateBOTDNotificationEmail(
    {
      displayName: params.creator.displayName,
      email: params.creator.email,
      slug: params.creator.slug,
      ownerUserId,
    },
    params.book,
    params.date,
    accountCredentials,
  );
  const subject = `Book of the Day on ${formatBotdDateLong(params.date)}: ${params.book.title}`;

  return { html, subject, ownerUserId };
}

export type BotdFeatureDayEmailSkipReason = "already_sent" | "no_email" | "no_creator";

export type BotdFeatureDayEmailItemOutcome =
  | { status: "sent" }
  | { status: "skipped"; reason: BotdFeatureDayEmailSkipReason }
  | { status: "failed"; reason: string };

export type BotdFeatureDayEmailRunResult = {
  featureDayEmailsSent: number;
  items: Array<{
    recipientType: "artist" | "publisher";
    creatorId: string;
    bookId: string;
    date: Date;
    outcome: BotdFeatureDayEmailItemOutcome;
  }>;
};

export type RunBotdFeatureDayEmailsResult = Result<
  BotdFeatureDayEmailRunResult,
  BotdEmailServiceError
>;

type BotdWithBook = {
  id: string;
  date: Date;
  artistEmailSentAt: Date | null;
  publisherEmailSentAt: Date | null;
  artistFeatureDayEmailSentAt: Date | null;
  publisherFeatureDayEmailSentAt: Date | null;
  book: BookCardResult & {
    artist?: (CreatorCardResult & { ownerUserId: string | null }) | null;
    publisher?: (CreatorCardResult & { ownerUserId: string | null }) | null;
  };
};

function addUtcDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

async function loadBotdForDate(
  day: Date,
): Promise<Result<BotdWithBook | null, BotdEmailServiceError>> {
  try {
    const row = await db.query.bookOfTheDay.findFirst({
      where: eq(bookOfTheDay.date, day),
      with: {
        book: {
          columns: BOOK_CARD_COLUMNS,
          with: {
            artist: { columns: CREATOR_BOTD_EMAIL_COLUMNS },
            publisher: { columns: CREATOR_BOTD_EMAIL_COLUMNS },
          },
        },
      },
    });
    return ok(row ?? null);
  } catch (error) {
    console.error("loadBotdForDate", error);
    return err({ reason: "Failed to load book of the day", cause: error });
  }
}

async function sendBotdFeatureDayEmailForRecipient(
  row: BotdWithBook,
  recipientType: "artist" | "publisher",
): Promise<Result<BotdFeatureDayEmailItemOutcome, BotdEmailServiceError>> {
  const alreadySent =
    recipientType === "artist"
      ? row.artistFeatureDayEmailSentAt
      : row.publisherFeatureDayEmailSentAt;
  if (alreadySent) {
    return ok({ status: "skipped", reason: "already_sent" });
  }

  const creator =
    recipientType === "artist" ? row.book.artist : row.book.publisher;
  if (!creator) {
    return ok({ status: "skipped", reason: "no_creator" });
  }

  const email = creator.email?.trim();
  if (!email) {
    return ok({ status: "skipped", reason: "no_email" });
  }

  const artistName = row.book.artist?.displayName ?? "the artist";
  const spotlightUrl = botdUrl(row.date);
  const html = buildBotdFeatureDayEmail({
    displayName: creator.displayName,
    recipientType,
    bookTitle: row.book.title,
    artistName,
    botdDate: row.date,
    spotlightUrl,
    instagram: creator.instagram,
  });

  const subject = `You're live — Book of the Day on Photobookers`;

  const [emailError] = await sendEmail(email, subject, html);
  if (emailError) {
    return ok({ status: "failed", reason: emailError.reason });
  }

  const markField =
    recipientType === "artist"
      ? "artistFeatureDayEmailSentAt"
      : "publisherFeatureDayEmailSentAt";

  const [markError] = await updateBookOfTheDayByDate(row.date, {
    [markField]: new Date(),
  });
  if (markError) return err(markError);

  return ok({ status: "sent" });
}

export type BotdAdvanceNotificationEmailSkipReason =
  | "already_sent"
  | "no_email"
  | "no_creator";

export type BotdAdvanceNotificationEmailItemOutcome =
  | { status: "sent" }
  | { status: "skipped"; reason: BotdAdvanceNotificationEmailSkipReason }
  | { status: "failed"; reason: string };

export type BotdAdvanceNotificationEmailRunResult = {
  advanceEmailsSent: number;
  featureDate: Date | null;
  items: Array<{
    recipientType: "artist" | "publisher";
    creatorId: string;
    bookId: string;
    date: Date;
    outcome: BotdAdvanceNotificationEmailItemOutcome;
  }>;
};

export type RunBotdAdvanceNotificationEmailsResult = Result<
  BotdAdvanceNotificationEmailRunResult,
  BotdEmailServiceError
>;

async function sendBotdAdvanceNotificationEmailForRecipient(
  row: BotdWithBook,
  recipientType: "artist" | "publisher",
): Promise<Result<BotdAdvanceNotificationEmailItemOutcome, BotdEmailServiceError>> {
  const alreadySent =
    recipientType === "artist"
      ? row.artistEmailSentAt
      : row.publisherEmailSentAt;
  if (alreadySent) {
    return ok({ status: "skipped", reason: "already_sent" });
  }

  const creator =
    recipientType === "artist" ? row.book.artist : row.book.publisher;
  if (!creator) {
    return ok({ status: "skipped", reason: "no_creator" });
  }

  const email = creator.email?.trim();
  if (!email) {
    return ok({ status: "skipped", reason: "no_email" });
  }

  const { html, subject } = await prepareBotdAdvanceNotificationContent({
    creator,
    book: row.book,
    date: row.date,
  });

  const [emailError] = await sendEmail(email, subject, html);
  if (emailError) {
    return ok({ status: "failed", reason: emailError.reason });
  }

  const markField =
    recipientType === "artist" ? "artistEmailSentAt" : "publisherEmailSentAt";

  const [markError] = await updateBookOfTheDayByDate(row.date, {
    [markField]: new Date(),
  });
  if (markError) return err(markError);

  return ok({ status: "sent" });
}

/** Sends advance BOTD notification emails for features exactly one week away. */
export async function runBotdAdvanceNotificationEmails(
  asOf: Date = new Date(),
): Promise<RunBotdAdvanceNotificationEmailsResult> {
  const featureDate = addUtcDays(toUtcStartOfDay(asOf), 7);
  const [loadError, row] = await loadBotdForDate(featureDate);
  if (loadError) return err(loadError);

  const result: BotdAdvanceNotificationEmailRunResult = {
    advanceEmailsSent: 0,
    featureDate: row?.date ?? null,
    items: [],
  };

  if (!row?.book) {
    return ok(result);
  }

  for (const recipientType of ["artist", "publisher"] as const) {
    const creator =
      recipientType === "artist" ? row.book.artist : row.book.publisher;
    if (!creator) continue;

    const [sendError, outcome] = await sendBotdAdvanceNotificationEmailForRecipient(
      row,
      recipientType,
    );
    if (sendError) return err(sendError);

    result.items.push({
      recipientType,
      creatorId: creator.id,
      bookId: row.book.id,
      date: row.date,
      outcome,
    });

    if (outcome.status === "sent") {
      result.advanceEmailsSent++;
      if (recipientType === "artist") {
        row.artistEmailSentAt = new Date();
      } else {
        row.publisherEmailSentAt = new Date();
      }
    }
  }

  return ok(result);
}

export async function runBotdFeatureDayEmails(
  asOf: Date = new Date(),
): Promise<RunBotdFeatureDayEmailsResult> {
  const day = toUtcStartOfDay(asOf);
  const [loadError, row] = await loadBotdForDate(day);
  if (loadError) return err(loadError);

  const result: BotdFeatureDayEmailRunResult = {
    featureDayEmailsSent: 0,
    items: [],
  };

  if (!row?.book) {
    return ok(result);
  }

  for (const recipientType of ["artist", "publisher"] as const) {
    const creator =
      recipientType === "artist" ? row.book.artist : row.book.publisher;
    if (!creator) continue;

    const [sendError, outcome] = await sendBotdFeatureDayEmailForRecipient(
      row,
      recipientType,
    );
    if (sendError) return err(sendError);

    result.items.push({
      recipientType,
      creatorId: creator.id,
      bookId: row.book.id,
      date: row.date,
      outcome,
    });

    if (outcome.status === "sent") {
      result.featureDayEmailsSent++;
      if (recipientType === "artist") {
        row.artistFeatureDayEmailSentAt = new Date();
      } else {
        row.publisherFeatureDayEmailSentAt = new Date();
      }
    }
  }

  return ok(result);
}

function manualSendOutcomeToReason(
  outcome:
    | { status: "skipped"; reason: string }
    | { status: "failed"; reason: string },
): string {
  switch (outcome.reason) {
    case "already_sent":
      return "Email already sent";
    case "no_email":
      return "Creator has no email";
    case "no_creator":
      return "Creator not found";
    default:
      return outcome.status === "failed"
        ? outcome.reason
        : "Email was not sent";
  }
}

export async function sendManualBotdEmail(
  date: Date,
  recipientType: "artist" | "publisher",
  emailKind: "advance" | "feature_day",
) {
  const day = toUtcStartOfDay(date);
  const [loadError, row] = await loadBotdForDate(day);
  if (loadError) return err(loadError);
  if (!row?.book) return err({ reason: "Book of the day not found" });

  const send =
    emailKind === "advance"
      ? sendBotdAdvanceNotificationEmailForRecipient
      : sendBotdFeatureDayEmailForRecipient;

  const [sendError, outcome] = await send(row, recipientType);
  if (sendError) return err(sendError);
  if (outcome.status !== "sent") {
    return err({ reason: manualSendOutcomeToReason(outcome) });
  }

  const { getBookOfTheDayForDateQuery } = await import(
    "../../../features/dashboard/admin/planner/services"
  );
  return getBookOfTheDayForDateQuery(day);
}
