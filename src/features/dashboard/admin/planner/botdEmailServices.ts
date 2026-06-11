import { eq } from "drizzle-orm";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
  type BookCardResult,
  type CreatorCardResult,
} from "../../../../constants/queries";
import { db } from "../../../../db/client";
import { bookOfTheDay } from "../../../../db/schema";
import { sendEmail } from "../../../../lib/sendEmail";
import { err, ok, type Result } from "../../../../lib/result";
import { toUtcStartOfDay } from "../../../../lib/utils";
import { botdUrl } from "../../../app/spotlightUrls";
import { buildBotdFeatureDayEmail } from "./emails";
import { updateBookOfTheDayByDate } from "./services";

type BotdEmailServiceError = { reason: string; cause?: unknown };

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
  artistFeatureDayEmailSentAt: Date | null;
  publisherFeatureDayEmailSentAt: Date | null;
  book: BookCardResult & {
    artist?: CreatorCardResult | null;
    publisher?: CreatorCardResult | null;
  };
};

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
            artist: { columns: CREATOR_CARD_COLUMNS },
            publisher: { columns: CREATOR_CARD_COLUMNS },
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
