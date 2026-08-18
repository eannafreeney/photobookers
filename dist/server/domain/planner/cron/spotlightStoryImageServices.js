import { eq } from "drizzle-orm";
import { db } from "../../../db/client.js";
import {
  artistOfTheWeek,
  publisherOfTheWeek
} from "../../../db/schema.js";
import { sendEmail } from "../../../lib/sendEmail.js";
import { ok } from "../../../lib/result.js";
import { toUtcStartOfDay, toWeekStart } from "../../../lib/utils.js";
import {
  buildSpotlightStoryImageRequestEmail
} from "../../../features/dashboard/admin/planner/emails.js";
import { createStoryUploadToken } from "../storyUploadToken.js";
async function loadSpotlightForWeek(kind, weekStart) {
  const week = toWeekStart(weekStart);
  if (kind === "artist") {
    const row2 = await db.query.artistOfTheWeek.findFirst({
      where: eq(artistOfTheWeek.weekStart, week),
      with: { creator: { columns: { id: true, displayName: true, email: true } } }
    });
    return row2 ?? null;
  }
  const row = await db.query.publisherOfTheWeek.findFirst({
    where: eq(publisherOfTheWeek.weekStart, week),
    with: { creator: { columns: { id: true, displayName: true, email: true } } }
  });
  return row ?? null;
}
async function markSent(kind, id) {
  const patch = {
    artistStoryImageEmailSentAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  };
  if (kind === "artist") {
    return db.update(artistOfTheWeek).set(patch).where(eq(artistOfTheWeek.id, id));
  }
  return db.update(publisherOfTheWeek).set(patch).where(eq(publisherOfTheWeek.id, id));
}
async function runSpotlightStoryImageEmails(asOf = /* @__PURE__ */ new Date()) {
  const targetWeek = toWeekStart(
    new Date(toUtcStartOfDay(asOf).getTime() + 14 * 24 * 60 * 60 * 1e3)
  );
  const result = {
    storyImageEmailsSent: 0,
    weekStart: targetWeek,
    items: []
  };
  for (const kind of ["artist", "publisher"]) {
    const row = await loadSpotlightForWeek(kind, targetWeek);
    if (!row?.creator) continue;
    const creator = row.creator;
    const email = creator.email?.trim();
    if (!email) {
      result.items.push({
        kind,
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "no_email" }
      });
      continue;
    }
    if (row.artistStoryImageEmailSentAt) {
      result.items.push({
        kind,
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "already_sent" }
      });
      continue;
    }
    const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
    const uploadToken = createStoryUploadToken(
      kind === "artist" ? "aotw" : "potw",
      row.id
    );
    const html = buildSpotlightStoryImageRequestEmail({
      displayName: creator.displayName,
      kind,
      weekStart: row.weekStart,
      exampleImageUrl: `${siteUrl}/examples/botd-story-example.png`,
      uploadUrl: `${siteUrl}/story-upload/${uploadToken}`
    });
    const subject = `Vertical image for your ${kind === "artist" ? "Artist" : "Publisher"} of the Week Instagram Story`;
    const [emailError] = await sendEmail(email, subject, html);
    if (emailError) {
      result.items.push({
        kind,
        creatorId: creator.id,
        outcome: { status: "failed", reason: emailError.reason }
      });
      continue;
    }
    await markSent(kind, row.id);
    result.storyImageEmailsSent++;
    result.items.push({
      kind,
      creatorId: creator.id,
      outcome: { status: "sent" }
    });
  }
  return ok(result);
}
export {
  runSpotlightStoryImageEmails
};
