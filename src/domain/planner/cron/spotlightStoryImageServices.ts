import { eq } from "drizzle-orm";
import { db } from "../../../db/client";
import {
  artistOfTheWeek,
  publisherOfTheWeek,
} from "../../../db/schema";
import { sendEmail } from "../../../lib/sendEmail";
import { err, ok, type Result } from "../../../lib/result";
import { toUtcStartOfDay, toWeekStart } from "../../../lib/utils";
import {
  buildSpotlightStoryImageRequestEmail,
} from "../../../features/dashboard/admin/planner/emails";
import { createStoryUploadToken } from "../storyUploadToken";

type SpotlightKind = "artist" | "publisher";

type Row = {
  id: string;
  weekStart: Date;
  artistStoryImageEmailSentAt: Date | null;
  creator: { id: string; displayName: string; email: string | null } | null;
};

async function loadSpotlightForWeek(
  kind: SpotlightKind,
  weekStart: Date,
): Promise<Row | null> {
  const week = toWeekStart(weekStart);
  if (kind === "artist") {
    const row = await db.query.artistOfTheWeek.findFirst({
      where: eq(artistOfTheWeek.weekStart, week),
      with: { creator: { columns: { id: true, displayName: true, email: true } } },
    });
    return row ?? null;
  }
  const row = await db.query.publisherOfTheWeek.findFirst({
    where: eq(publisherOfTheWeek.weekStart, week),
    with: { creator: { columns: { id: true, displayName: true, email: true } } },
  });
  return row ?? null;
}

async function markSent(kind: SpotlightKind, id: string) {
  const patch = {
    artistStoryImageEmailSentAt: new Date(),
    updatedAt: new Date(),
  };
  if (kind === "artist") {
    return db
      .update(artistOfTheWeek)
      .set(patch)
      .where(eq(artistOfTheWeek.id, id));
  }
  return db
    .update(publisherOfTheWeek)
    .set(patch)
    .where(eq(publisherOfTheWeek.id, id));
}

export type SpotlightStoryImageEmailRunResult = {
  storyImageEmailsSent: number;
  weekStart: Date | null;
  items: Array<{
    kind: SpotlightKind;
    creatorId: string;
    outcome: { status: "sent" } | { status: "skipped"; reason: string } | { status: "failed"; reason: string };
  }>;
};

export type RunSpotlightStoryImageEmailsResult = Result<
  SpotlightStoryImageEmailRunResult,
  { reason: string }
>;

/** Sends vertical story-image requests to AOTW/POTW creators ~14 days before their week. */
export async function runSpotlightStoryImageEmails(
  asOf: Date = new Date(),
): Promise<RunSpotlightStoryImageEmailsResult> {
  const targetWeek = toWeekStart(
    new Date(toUtcStartOfDay(asOf).getTime() + 14 * 24 * 60 * 60 * 1000),
  );

  const result: SpotlightStoryImageEmailRunResult = {
    storyImageEmailsSent: 0,
    weekStart: targetWeek,
    items: [],
  };

  for (const kind of ["artist", "publisher"] as const) {
    const row = await loadSpotlightForWeek(kind, targetWeek);
    if (!row?.creator) continue;

    const creator = row.creator;
    const email = creator.email?.trim();
    if (!email) {
      result.items.push({
        kind,
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "no_email" },
      });
      continue;
    }

    if (row.artistStoryImageEmailSentAt) {
      result.items.push({
        kind,
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "already_sent" },
      });
      continue;
    }

    const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
    const uploadToken = createStoryUploadToken(
      kind === "artist" ? "aotw" : "potw",
      row.id,
    );
    const html = buildSpotlightStoryImageRequestEmail({
      displayName: creator.displayName,
      kind,
      weekStart: row.weekStart,
      exampleImageUrl: `${siteUrl}/examples/botd-story-example.png`,
      uploadUrl: `${siteUrl}/story-upload/${uploadToken}`,
    });
    const subject = `Vertical image for your ${kind === "artist" ? "Artist" : "Publisher"} of the Week Instagram Story`;

    const [emailError] = await sendEmail(email, subject, html);
    if (emailError) {
      result.items.push({
        kind,
        creatorId: creator.id,
        outcome: { status: "failed", reason: emailError.reason },
      });
      continue;
    }

    await markSent(kind, row.id);
    result.storyImageEmailsSent++;
    result.items.push({
      kind,
      creatorId: creator.id,
      outcome: { status: "sent" },
    });
  }

  return ok(result);
}
