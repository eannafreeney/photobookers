import { and, asc, desc, eq, gte, isNotNull, lt, lte } from "drizzle-orm";
import { db } from "../../../../db/client.js";
import {
  artistOfTheWeek,
  bookFairs,
  books,
  creators,
  newsletterCampaigns,
  publisherOfTheWeek
} from "../../../../db/schema.js";
import { getBooksOfTheDayInRange } from "../../../app/BOTDServices.js";
import { getTopBooksByViews } from "../../../book-views/services.js";
import { getTopCreatorsByViews } from "../../../creator-views/services.js";
import { CREATOR_CARD_COLUMNS } from "../../../../constants/queries.js";
import { err, ok } from "../../../../lib/result.js";
import {
  formatCreatorLocation,
  normalizeStoredDate,
  parseDateString,
  toDateString,
  toWeekStart,
  toWeekString
} from "../../../../lib/utils.js";
import {
  getCurrentNewsletterRange,
  resolveNewsletterRangeStart
} from "./newsletterUtils.js";
const NEW_MEMBERS_LIMIT = 6;
const TRENDING_LIMIT = 3;
function normalizeWeekStartDate(weekStart) {
  return parseDateString(toDateString(weekStart));
}
function getNewsletterCampaignRange(campaign) {
  const weekStart = resolveNewsletterRangeStart(campaign.weekStart);
  const weekEnd = getWeekEndDate(weekStart);
  return { weekStart, weekEnd };
}
function getWeekEndDate(weekStart) {
  const start = normalizeWeekStartDate(weekStart);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return end;
}
async function findNewsletterCampaignByWeekStart(weekStart) {
  const targetKey = toDateString(normalizeWeekStartDate(weekStart));
  const rows = await db.query.newsletterCampaigns.findMany({
    orderBy: [desc(newsletterCampaigns.weekStart)],
    limit: 64
  });
  return rows.find(
    (row) => toDateString(normalizeStoredDate(row.weekStart)) === targetKey
  ) ?? null;
}
const toCreatorSpotlight = (creator, weekStart) => creator ? {
  displayName: creator.displayName,
  slug: creator.slug,
  weekKey: toWeekString(toWeekStart(weekStart)),
  coverUrl: creator.coverUrl ?? null,
  tagline: creator.tagline?.trim() || null,
  location: formatCreatorLocation(creator.city, creator.country)
} : null;
async function getNewlyVerifiedCreatorsInRange(rangeStart, rangeEnd) {
  const rangeEndExclusive = new Date(rangeEnd);
  rangeEndExclusive.setUTCDate(rangeEndExclusive.getUTCDate() + 1);
  const rows = await db.query.creators.findMany({
    where: and(
      eq(creators.status, "verified"),
      isNotNull(creators.verifiedAt),
      gte(creators.verifiedAt, rangeStart),
      lt(creators.verifiedAt, rangeEndExclusive)
    ),
    columns: {
      displayName: true,
      slug: true,
      type: true,
      coverUrl: true,
      tagline: true,
      city: true,
      country: true
    },
    with: {
      booksAsArtist: {
        columns: { id: true },
        where: eq(books.publicationStatus, "published")
      },
      booksAsPublisher: {
        columns: { id: true },
        where: eq(books.publicationStatus, "published")
      }
    },
    orderBy: [asc(creators.verifiedAt)]
  });
  return rows.filter(
    (creator) => creator.booksAsArtist.length > 0 || creator.booksAsPublisher.length > 0
  ).slice(0, NEW_MEMBERS_LIMIT).map(({ booksAsArtist, booksAsPublisher, ...creator }) => ({
    displayName: creator.displayName,
    slug: creator.slug,
    type: creator.type,
    coverUrl: creator.coverUrl ?? null,
    tagline: creator.tagline?.trim() || null,
    location: formatCreatorLocation(creator.city, creator.country)
  }));
}
async function getWeeklyCreatorSpotlights(sendWednesday) {
  const normalizedWeekStart = toWeekStart(sendWednesday);
  const [artistEntry, publisherEntry] = await Promise.all([
    db.query.artistOfTheWeek.findFirst({
      where: eq(artistOfTheWeek.weekStart, normalizedWeekStart),
      with: { creator: { columns: CREATOR_CARD_COLUMNS } }
    }),
    db.query.publisherOfTheWeek.findFirst({
      where: eq(publisherOfTheWeek.weekStart, normalizedWeekStart),
      with: { creator: { columns: CREATOR_CARD_COLUMNS } }
    })
  ]);
  return {
    artistOfTheWeek: toCreatorSpotlight(
      artistEntry?.creator,
      normalizedWeekStart
    ),
    publisherOfTheWeek: toCreatorSpotlight(
      publisherEntry?.creator,
      normalizedWeekStart
    )
  };
}
async function getUpcomingFairForNextWeek(sendWednesday) {
  const nextWeekStart = new Date(sendWednesday);
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 1);
  const nextWeekEnd = new Date(sendWednesday);
  nextWeekEnd.setUTCDate(nextWeekEnd.getUTCDate() + 7);
  const fair = await db.query.bookFairs.findFirst({
    where: and(
      eq(bookFairs.status, "published"),
      eq(bookFairs.approvalStatus, "approved"),
      gte(bookFairs.startDate, nextWeekStart),
      lte(bookFairs.startDate, nextWeekEnd)
    ),
    columns: {
      name: true,
      slug: true,
      coverUrl: true,
      venue: true,
      city: true,
      country: true,
      startDate: true,
      endDate: true
    },
    orderBy: [asc(bookFairs.startDate)]
  });
  if (!fair) return null;
  return {
    name: fair.name,
    slug: fair.slug,
    coverUrl: fair.coverUrl ?? null,
    venue: fair.venue?.trim() || null,
    location: formatCreatorLocation(fair.city, fair.country),
    startDate: toDateString(fair.startDate),
    endDate: toDateString(fair.endDate)
  };
}
async function getTrendingForEdition(rangeStart, rangeEnd) {
  const range = { from: rangeStart, to: rangeEnd };
  const [booksResult, artistsResult, publishersResult] = await Promise.all([
    getTopBooksByViews(range, 1, TRENDING_LIMIT),
    getTopCreatorsByViews(range, 1, TRENDING_LIMIT, "artist"),
    getTopCreatorsByViews(range, 1, TRENDING_LIMIT, "publisher")
  ]);
  if (booksResult[0]) {
    console.error("getTrendingForEdition books", booksResult[0].reason);
  }
  if (artistsResult[0]) {
    console.error("getTrendingForEdition artists", artistsResult[0].reason);
  }
  if (publishersResult[0]) {
    console.error(
      "getTrendingForEdition publishers",
      publishersResult[0].reason
    );
  }
  const books2 = booksResult[1]?.books.map((book) => ({
    bookId: book.bookId,
    bookSlug: book.slug,
    title: book.title,
    coverUrl: book.coverUrl,
    artistName: book.artistName,
    publisherName: book.publisherName
  })) ?? [];
  const toTrendingCreator = (row) => ({
    displayName: row.displayName,
    slug: row.slug,
    type: row.type,
    coverUrl: row.coverUrl
  });
  const artists = artistsResult[1]?.creators.filter((c) => c.type === "artist").map(toTrendingCreator) ?? [];
  const publishers = publishersResult[1]?.creators.filter((c) => c.type === "publisher").map(toTrendingCreator) ?? [];
  return { books: books2, artists, publishers };
}
const DEFAULT_WEEKLY_NEWSLETTER_SUBJECT = "This week on photobookers";
const DEFAULT_WEEKLY_NEWSLETTER_INTRO = "We have some new books for you to check out. See below";
const DEFAULT_WEEKLY_NEWSLETTER_OUTRO = "Thanks for following photobookers. Reply and tell us which book stood out to you most.";
const DEFAULT_WEEKLY_NEWSLETTER_CTA = "Visit photobookers";
async function buildWeeklyBOTDGeneratedContent(weekStart, weekEnd, options) {
  const normalize = options?.fromDatabase ? normalizeStoredDate : (d) => parseDateString(toDateString(d));
  const rangeStart = normalize(weekStart);
  const rangeEnd = normalize(weekEnd);
  const [rangeError, rangeResult] = await getBooksOfTheDayInRange(
    rangeStart,
    rangeEnd
  );
  if (rangeError) return err({ reason: rangeError.reason });
  const [{ artistOfTheWeek: artistOfTheWeek2, publisherOfTheWeek: publisherOfTheWeek2 }, newMembers, upcomingFair, trending] = await Promise.all([
    getWeeklyCreatorSpotlights(rangeEnd),
    getNewlyVerifiedCreatorsInRange(rangeStart, rangeEnd),
    getUpcomingFairForNextWeek(rangeEnd),
    getTrendingForEdition(rangeStart, rangeEnd)
  ]);
  const items = rangeResult.botdEntries.map(
    (entry) => ({
      date: toDateString(entry.date),
      bookId: entry.book.id,
      bookSlug: entry.book.slug,
      title: entry.book.title,
      coverUrl: entry.book.coverUrl ?? null,
      artistName: entry.book.artist?.displayName ?? null,
      artistSlug: entry.book.artist?.slug ?? null,
      publisherName: entry.book.publisher?.displayName ?? null,
      publisherSlug: entry.book.publisher?.slug ?? null
    })
  );
  return ok({
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    items,
    newMembers,
    upcomingFair,
    artistOfTheWeek: artistOfTheWeek2,
    publisherOfTheWeek: publisherOfTheWeek2,
    trending
  });
}
async function ensureCurrentWeeklyNewsletterDraft() {
  const { weekStart, weekEnd } = getCurrentNewsletterRange();
  return ensureWeeklyNewsletterDraftForRange(weekStart, weekEnd);
}
async function ensureWeeklyNewsletterDraftForRange(weekStart, _weekEnd) {
  const normalizedStart = resolveNewsletterRangeStart(weekStart);
  const normalizedEnd = getWeekEndDate(normalizedStart);
  const existing = await findNewsletterCampaignByWeekStart(normalizedStart);
  if (existing) return ok(existing);
  const [generatedError, generated] = await buildWeeklyBOTDGeneratedContent(
    normalizedStart,
    normalizedEnd
  );
  if (generatedError) return err(generatedError);
  try {
    const [created] = await db.insert(newsletterCampaigns).values({
      weekStart: normalizedStart,
      weekEnd: normalizedEnd,
      status: "draft",
      subject: DEFAULT_WEEKLY_NEWSLETTER_SUBJECT,
      introText: DEFAULT_WEEKLY_NEWSLETTER_INTRO,
      outroText: DEFAULT_WEEKLY_NEWSLETTER_OUTRO,
      ctaText: DEFAULT_WEEKLY_NEWSLETTER_CTA,
      generatedContent: generated
    }).onConflictDoNothing({
      target: newsletterCampaigns.weekStart
    }).returning();
    if (!created) {
      const campaign = await findNewsletterCampaignByWeekStart(normalizedStart);
      if (!campaign)
        return err({ reason: "Failed to create or load newsletter draft" });
      return ok(campaign);
    }
    return ok(created);
  } catch (e) {
    console.error("ensureWeeklyNewsletterDraftForRange", e);
    return err({ reason: "Failed to create weekly newsletter draft" });
  }
}
async function listNewsletterCampaigns(limit = 12) {
  return db.query.newsletterCampaigns.findMany({
    orderBy: [desc(newsletterCampaigns.weekStart)],
    limit
  });
}
async function getNewsletterCampaignById(campaignId) {
  return db.query.newsletterCampaigns.findFirst({
    where: eq(newsletterCampaigns.id, campaignId)
  });
}
async function deleteNewsletterCampaign(campaignId) {
  const campaign = await getNewsletterCampaignById(campaignId);
  if (!campaign) return err({ reason: "Newsletter campaign not found" });
  if (campaign.status === "sent") {
    return err({
      reason: "Cannot delete a campaign that has already been sent"
    });
  }
  try {
    const [row] = await db.delete(newsletterCampaigns).where(eq(newsletterCampaigns.id, campaignId)).returning();
    if (!row) return err({ reason: "Newsletter campaign not found" });
    return ok(row);
  } catch (e) {
    console.error("deleteNewsletterCampaign", e);
    return err({ reason: "Failed to delete newsletter campaign" });
  }
}
async function updateNewsletterCampaignDraft(campaignId, patch) {
  const updateData = {
    updatedAt: /* @__PURE__ */ new Date()
  };
  if (patch.weekStart !== void 0) updateData.weekStart = patch.weekStart;
  if (patch.weekEnd !== void 0) updateData.weekEnd = patch.weekEnd;
  if (patch.subject !== void 0) updateData.subject = patch.subject;
  if (patch.introText !== void 0) updateData.introText = patch.introText;
  if (patch.outroText !== void 0) updateData.outroText = patch.outroText;
  if (patch.ctaText !== void 0) updateData.ctaText = patch.ctaText;
  if (patch.status !== void 0) updateData.status = patch.status;
  if (patch.generatedContent !== void 0)
    updateData.generatedContent = patch.generatedContent;
  if (patch.sentAt !== void 0) updateData.sentAt = patch.sentAt;
  try {
    const [row] = await db.update(newsletterCampaigns).set(updateData).where(eq(newsletterCampaigns.id, campaignId)).returning();
    if (!row) return err({ reason: "Newsletter campaign not found" });
    return ok(row);
  } catch (e) {
    console.error("updateNewsletterCampaignDraft", e);
    return err({ reason: "Failed to update newsletter campaign" });
  }
}
async function regenerateCampaignContent(campaignId) {
  const campaign = await getNewsletterCampaignById(campaignId);
  if (!campaign) return err({ reason: "Newsletter campaign not found" });
  if (campaign.status === "sent")
    return err({ reason: "Cannot regenerate a sent campaign" });
  const { weekStart, weekEnd } = getNewsletterCampaignRange(campaign);
  const [generatedError, generated] = await buildWeeklyBOTDGeneratedContent(
    weekStart,
    weekEnd,
    { fromDatabase: true }
  );
  if (generatedError) return err(generatedError);
  const [updateError] = await updateNewsletterCampaignDraft(campaignId, {
    weekStart,
    weekEnd,
    generatedContent: generated,
    status: "draft",
    sentAt: null
  });
  if (updateError) return err(updateError);
  return ok(generated);
}
const normalizeStoredCreatorSpotlight = (creator, fallbackWeekKey) => {
  if (!creator) return null;
  return {
    displayName: creator.displayName,
    slug: creator.slug,
    weekKey: creator.weekKey ?? fallbackWeekKey,
    coverUrl: creator.coverUrl ?? null,
    tagline: creator.tagline?.trim() || null,
    location: creator.location?.trim() || null
  };
};
async function buildCampaignPreviewHtml(campaign) {
  const stored = campaign.generatedContent;
  const { weekStart, weekEnd } = getNewsletterCampaignRange(campaign);
  const [generatedError, generated] = await buildWeeklyBOTDGeneratedContent(
    weekStart,
    weekEnd,
    { fromDatabase: true }
  );
  if (generatedError) {
    console.error("buildCampaignPreviewHtml", generatedError.reason);
  }
  const spotlightWeekKey = toWeekString(toWeekStart(weekEnd));
  const { artistOfTheWeek: artistOfTheWeek2, publisherOfTheWeek: publisherOfTheWeek2 } = await getWeeklyCreatorSpotlights(weekEnd);
  const { renderWeeklyBOTDNewsletterHtmlMjml } = await import("./newsletterTemplateMjml.js");
  return renderWeeklyBOTDNewsletterHtmlMjml({
    weekStart,
    weekEnd,
    subject: campaign.subject,
    introText: campaign.introText,
    outroText: campaign.outroText,
    ctaText: campaign.ctaText,
    items: generated?.items ?? stored?.items ?? [],
    newMembers: generated?.newMembers ?? stored?.newMembers ?? [],
    upcomingFair: generated?.upcomingFair ?? stored?.upcomingFair ?? null,
    artistOfTheWeek: artistOfTheWeek2 ?? normalizeStoredCreatorSpotlight(
      stored?.artistOfTheWeek,
      spotlightWeekKey
    ),
    publisherOfTheWeek: publisherOfTheWeek2 ?? normalizeStoredCreatorSpotlight(
      stored?.publisherOfTheWeek,
      spotlightWeekKey
    ),
    trending: generated?.trending ?? stored?.trending
  });
}
async function getCampaignsByStatusInRange(status, from, to) {
  return db.query.newsletterCampaigns.findMany({
    where: and(
      eq(newsletterCampaigns.status, status),
      gte(newsletterCampaigns.weekStart, from),
      lte(newsletterCampaigns.weekStart, to)
    )
  });
}
export {
  DEFAULT_WEEKLY_NEWSLETTER_CTA,
  DEFAULT_WEEKLY_NEWSLETTER_INTRO,
  DEFAULT_WEEKLY_NEWSLETTER_OUTRO,
  DEFAULT_WEEKLY_NEWSLETTER_SUBJECT,
  buildCampaignPreviewHtml,
  buildWeeklyBOTDGeneratedContent,
  deleteNewsletterCampaign,
  ensureCurrentWeeklyNewsletterDraft,
  ensureWeeklyNewsletterDraftForRange,
  findNewsletterCampaignByWeekStart,
  getCampaignsByStatusInRange,
  getNewsletterCampaignById,
  getNewsletterCampaignRange,
  getWeekEndDate,
  listNewsletterCampaigns,
  normalizeWeekStartDate,
  regenerateCampaignContent,
  updateNewsletterCampaignDraft
};
