import { eq } from "drizzle-orm";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS
} from "../../../constants/queries.js";
import { db } from "../../../db/client.js";
import { bookOfTheDay } from "../../../db/schema.js";
import { sendEmail } from "../../../lib/sendEmail.js";
import { err, ok } from "../../../lib/result.js";
import { toUtcStartOfDay } from "../../../lib/utils.js";
import { botdUrl } from "../../../features/app/spotlightUrls.js";
import { provisionCreatorUserAccount } from "../../../features/dashboard/admin/users/provisionCreatorAccount.js";
import {
  buildBotdFeatureDayEmail,
  generateBOTDNotificationEmail
} from "../../../features/dashboard/admin/planner/emails.js";
import { updateBookOfTheDayByDate } from "../../../features/dashboard/admin/planner/services.js";
import { formatBotdDateLong } from "../../../features/dashboard/admin/planner/utils.js";
const CREATOR_BOTD_EMAIL_COLUMNS = {
  ...CREATOR_CARD_COLUMNS,
  ownerUserId: true
};
async function prepareBotdAdvanceNotificationContent(params) {
  const email = params.creator.email?.trim();
  let ownerUserId = params.creator.ownerUserId ?? null;
  let accountCredentials;
  if (!ownerUserId && email) {
    const [provisionError, provision] = await provisionCreatorUserAccount({
      creatorId: params.creator.id,
      email,
      displayName: params.creator.displayName
    });
    if (provisionError) {
      console.error(
        "prepareBotdAdvanceNotificationContent provision",
        provisionError
      );
    } else if (provision.status === "created") {
      ownerUserId = provision.ownerUserId;
      accountCredentials = {
        kind: "created",
        email: provision.email,
        temporaryPassword: provision.temporaryPassword,
        loginUrl: provision.loginUrl
      };
    } else if (provision.status === "linked_existing") {
      ownerUserId = provision.ownerUserId;
      accountCredentials = {
        kind: "linked",
        email: provision.email,
        loginUrl: provision.loginUrl
      };
    } else if (provision.status === "failed") {
      console.error(
        "prepareBotdAdvanceNotificationContent provision failed",
        provision.reason
      );
    }
  }
  const html = generateBOTDNotificationEmail(
    {
      displayName: params.creator.displayName,
      email: params.creator.email,
      slug: params.creator.slug,
      ownerUserId
    },
    params.book,
    params.date,
    accountCredentials
  );
  const subject = `Book of the Day on ${formatBotdDateLong(params.date)}: ${params.book.title}`;
  return { html, subject, ownerUserId };
}
function addUtcDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
async function loadBotdForDate(day) {
  try {
    const row = await db.query.bookOfTheDay.findFirst({
      where: eq(bookOfTheDay.date, day),
      with: {
        book: {
          columns: BOOK_CARD_COLUMNS,
          with: {
            artist: { columns: CREATOR_BOTD_EMAIL_COLUMNS },
            publisher: { columns: CREATOR_BOTD_EMAIL_COLUMNS }
          }
        }
      }
    });
    return ok(row ?? null);
  } catch (error) {
    console.error("loadBotdForDate", error);
    return err({ reason: "Failed to load book of the day", cause: error });
  }
}
async function sendBotdFeatureDayEmailForRecipient(row, recipientType) {
  const alreadySent = recipientType === "artist" ? row.artistFeatureDayEmailSentAt : row.publisherFeatureDayEmailSentAt;
  if (alreadySent) {
    return ok({ status: "skipped", reason: "already_sent" });
  }
  const creator = recipientType === "artist" ? row.book.artist : row.book.publisher;
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
    instagram: creator.instagram
  });
  const subject = `You're live \u2014 Book of the Day on Photobookers`;
  const [emailError] = await sendEmail(email, subject, html);
  if (emailError) {
    return ok({ status: "failed", reason: emailError.reason });
  }
  const markField = recipientType === "artist" ? "artistFeatureDayEmailSentAt" : "publisherFeatureDayEmailSentAt";
  const [markError] = await updateBookOfTheDayByDate(row.date, {
    [markField]: /* @__PURE__ */ new Date()
  });
  if (markError) return err(markError);
  return ok({ status: "sent" });
}
async function sendBotdAdvanceNotificationEmailForRecipient(row, recipientType) {
  const alreadySent = recipientType === "artist" ? row.artistEmailSentAt : row.publisherEmailSentAt;
  if (alreadySent) {
    return ok({ status: "skipped", reason: "already_sent" });
  }
  const creator = recipientType === "artist" ? row.book.artist : row.book.publisher;
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
    date: row.date
  });
  const [emailError] = await sendEmail(email, subject, html);
  if (emailError) {
    return ok({ status: "failed", reason: emailError.reason });
  }
  const markField = recipientType === "artist" ? "artistEmailSentAt" : "publisherEmailSentAt";
  const [markError] = await updateBookOfTheDayByDate(row.date, {
    [markField]: /* @__PURE__ */ new Date()
  });
  if (markError) return err(markError);
  return ok({ status: "sent" });
}
async function runBotdAdvanceNotificationEmails(asOf = /* @__PURE__ */ new Date()) {
  const featureDate = addUtcDays(toUtcStartOfDay(asOf), 7);
  const [loadError, row] = await loadBotdForDate(featureDate);
  if (loadError) return err(loadError);
  const result = {
    advanceEmailsSent: 0,
    featureDate: row?.date ?? null,
    items: []
  };
  if (!row?.book) {
    return ok(result);
  }
  for (const recipientType of ["artist", "publisher"]) {
    const creator = recipientType === "artist" ? row.book.artist : row.book.publisher;
    if (!creator) continue;
    const [sendError, outcome] = await sendBotdAdvanceNotificationEmailForRecipient(
      row,
      recipientType
    );
    if (sendError) return err(sendError);
    result.items.push({
      recipientType,
      creatorId: creator.id,
      bookId: row.book.id,
      date: row.date,
      outcome
    });
    if (outcome.status === "sent") {
      result.advanceEmailsSent++;
      if (recipientType === "artist") {
        row.artistEmailSentAt = /* @__PURE__ */ new Date();
      } else {
        row.publisherEmailSentAt = /* @__PURE__ */ new Date();
      }
    }
  }
  return ok(result);
}
async function runBotdFeatureDayEmails(asOf = /* @__PURE__ */ new Date()) {
  const day = toUtcStartOfDay(asOf);
  const [loadError, row] = await loadBotdForDate(day);
  if (loadError) return err(loadError);
  const result = {
    featureDayEmailsSent: 0,
    items: []
  };
  if (!row?.book) {
    return ok(result);
  }
  for (const recipientType of ["artist", "publisher"]) {
    const creator = recipientType === "artist" ? row.book.artist : row.book.publisher;
    if (!creator) continue;
    const [sendError, outcome] = await sendBotdFeatureDayEmailForRecipient(
      row,
      recipientType
    );
    if (sendError) return err(sendError);
    result.items.push({
      recipientType,
      creatorId: creator.id,
      bookId: row.book.id,
      date: row.date,
      outcome
    });
    if (outcome.status === "sent") {
      result.featureDayEmailsSent++;
      if (recipientType === "artist") {
        row.artistFeatureDayEmailSentAt = /* @__PURE__ */ new Date();
      } else {
        row.publisherFeatureDayEmailSentAt = /* @__PURE__ */ new Date();
      }
    }
  }
  return ok(result);
}
function manualSendOutcomeToReason(outcome) {
  switch (outcome.reason) {
    case "already_sent":
      return "Email already sent";
    case "no_email":
      return "Creator has no email";
    case "no_creator":
      return "Creator not found";
    default:
      return outcome.status === "failed" ? outcome.reason : "Email was not sent";
  }
}
async function sendManualBotdEmail(date, recipientType, emailKind) {
  const day = toUtcStartOfDay(date);
  const [loadError, row] = await loadBotdForDate(day);
  if (loadError) return err(loadError);
  if (!row?.book) return err({ reason: "Book of the day not found" });
  const send = emailKind === "advance" ? sendBotdAdvanceNotificationEmailForRecipient : sendBotdFeatureDayEmailForRecipient;
  const [sendError, outcome] = await send(row, recipientType);
  if (sendError) return err(sendError);
  if (outcome.status !== "sent") {
    return err({ reason: manualSendOutcomeToReason(outcome) });
  }
  const { getBookOfTheDayForDateQuery } = await import("../../../features/dashboard/admin/planner/services.js");
  return getBookOfTheDayForDateQuery(day);
}
export {
  prepareBotdAdvanceNotificationContent,
  runBotdAdvanceNotificationEmails,
  runBotdFeatureDayEmails,
  sendManualBotdEmail
};
