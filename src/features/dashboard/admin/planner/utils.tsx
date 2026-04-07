import Alert from "../../../../components/app/Alert";
import { Book } from "../../../../db/schema";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import { sendEmail } from "../../../../lib/sendEmail";
import { parseWeekString, toWeekString } from "../../../../lib/utils";
import { getBookById, getBookByIdBasic } from "../../books/services";
import {
  generateBOTWNotificationEmail,
  generateFeaturedBookNotificationEmail,
} from "./emails";
import {
  updateBookOfTheWeekByWeekStart,
  updateFeaturedBookOfTheWeekByWeekStart,
} from "./services";
import { Context } from "hono";

/** All ISO week-start dates (Mondays) for a given year. Returns 52 or 53 dates. */
export function getWeekStarts(year: number): Date[] {
  const firstMonday = parseWeekString(`${year}-W01`);
  const weekStarts: Date[] = [];
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  for (let k = 0; k < 53; k++) {
    const d = new Date(firstMonday.getTime() + k * msPerWeek);
    if (toWeekString(d).startsWith(`${year}-`)) {
      weekStarts.push(d);
    }
  }
  return weekStarts;
}

/** Format a week as "Mon DD – Sun DD, YYYY" for planner display */
export function formatWeekRange(weekStart: Date): string {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  const monthStart = start.toLocaleString("en-US", { month: "short" });
  const monthEnd = end.toLocaleString("en-US", { month: "short" });
  const dayStart = start.getUTCDate();
  const dayEnd = end.getUTCDate();
  const year = end.getUTCFullYear();
  if (monthStart === monthEnd) {
    return `${monthStart} ${dayStart}–${dayEnd}, ${year}`;
  }
  return `${monthStart} ${dayStart} – ${monthEnd} ${dayEnd}, ${year}`;
}

/** Get ISO week number (1–53) from a week-start Date */
export function getWeekNumber(weekStart: Date): number {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + 3);
  const jan1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return (
    1 +
    Math.ceil(
      (d.getTime() - jan1.getTime()) / (7 * 24 * 60 * 60 * 1000) -
        ((jan1.getUTCDay() + 6) % 7) / 7,
    )
  );
}

export function isWeekInPast(weekStart: Date): boolean {
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const day = today.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  today.setUTCDate(today.getUTCDate() - daysToMonday);
  return weekStart.getTime() < today.getTime();
}

export const sendBookOfTheWeekCreatorEmail = async (
  c: any,
  creator: {
    displayName: string;
    email: string;
    id: string;
    type: "artist" | "publisher";
    slug: string;
    ownerUserId: string;
  },
  weekStart: string,
  recipientType: "artist" | "publisher",
  bookId: string,
) => {
  const [bookError, book] = await getBookById(bookId);
  if (bookError || !book) return showErrorAlert(c, "Book not found");

  const html = generateBOTWNotificationEmail(creator, book);
  const [emailError] = await sendEmail(
    creator.email,
    `Book of the Week: ${book.title}`,
    html,
  );
  if (emailError) return showErrorAlert(c, emailError.reason);

  const updateField =
    recipientType === "artist" ? "artistEmailSentAt" : "publisherEmailSentAt";

  const [updateError] = await updateBookOfTheWeekByWeekStart(
    parseWeekString(weekStart),
    {
      [updateField]: new Date(),
    },
  );
  if (updateError) return showErrorAlert(c, updateError.reason);

  return c.html(
    <>
      <Alert type="success" message="Email Sent" />
      {dispatchEvents(["planner:updated"])}
    </>,
  );
};

export const sendFeaturedBookCreatorEmail = async (
  c: Context,
  weekStart: string,
  recipientType: "artist" | "publisher",
  bookId: string,
  creator: {
    displayName: string;
    email: string | null;
    id: string;
    type: "artist" | "publisher";
    slug: string;
    ownerUserId: string | null;
  },
) => {
  // make smaller query for book
  const [bookError, book] = await getBookByIdBasic(bookId);
  if (bookError || !book) return showErrorAlert(c, "Book not found");
  if (!creator.email) return showErrorAlert(c, "Creator email not found");

  const html = generateFeaturedBookNotificationEmail(creator, book);
  const [emailError] = await sendEmail(
    creator.email,
    `Featured Book: ${book.title}`,
    html,
  );
  if (emailError) return showErrorAlert(c, emailError.reason);

  const updateField =
    recipientType === "artist" ? "artistEmailSentAt" : "publisherEmailSentAt";
  const week = parseWeekString(weekStart);

  const [updateError] = await updateFeaturedBookOfTheWeekByWeekStart(week, {
    [updateField]: new Date(),
  });
  if (updateError) return showErrorAlert(c, updateError.reason);

  return c.html(
    <>
      <Alert type="success" message="Email Sent" />
      {dispatchEvents(["planner:updated"])}
    </>,
  );
};
