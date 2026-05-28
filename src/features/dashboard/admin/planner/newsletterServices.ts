import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "../../../../db/client";
import {
  type NewsletterCampaignStatus,
  newsletterCampaigns,
} from "../../../../db/schema";
import { getBooksOfTheDayInRange } from "../../../app/BOTDServices";
import { err, ok } from "../../../../lib/result";
import { toDateString } from "../../../../lib/utils";
import {
  renderWeeklyBOTDNewsletterHtml,
  type WeeklyNewsletterBookItem,
} from "./newsletterTemplate";
import { formatWeekRangeLabel, getPreviousWeekRange } from "./newsletterUtils";

export type WeeklyNewsletterGeneratedContent = {
  generatedAt: string;
  items: WeeklyNewsletterBookItem[];
};

export const DEFAULT_WEEKLY_NEWSLETTER_SUBJECT =
  "This week on photobookers: Book of the Day roundup";
export const DEFAULT_WEEKLY_NEWSLETTER_INTRO =
  "Here are this week's Book of the Day picks. Discover new photobooks and the creators behind them.";
export const DEFAULT_WEEKLY_NEWSLETTER_OUTRO =
  "Thanks for following photobookers. Reply and tell us which book stood out to you most.";
export const DEFAULT_WEEKLY_NEWSLETTER_CTA = "Explore all books";

export async function buildWeeklyBOTDGeneratedContent(
  weekStart: Date,
  weekEnd: Date,
): Promise<
  [null, WeeklyNewsletterGeneratedContent] | [{ reason: string }, null]
> {
  const [rangeError, rangeResult] = await getBooksOfTheDayInRange(
    weekStart,
    weekEnd,
  );
  if (rangeError) return err({ reason: rangeError.reason });

  const items: WeeklyNewsletterBookItem[] = rangeResult.botdEntries.map(
    (entry) => ({
      date: toDateString(entry.date),
      bookId: entry.book.id,
      bookSlug: entry.book.slug,
      title: entry.book.title,
      coverUrl: entry.book.coverUrl ?? null,
      artistName: entry.book.artist?.displayName ?? null,
      artistSlug: entry.book.artist?.slug ?? null,
      publisherName: entry.book.publisher?.displayName ?? null,
      publisherSlug: entry.book.publisher?.slug ?? null,
    }),
  );

  return ok({
    generatedAt: new Date().toISOString(),
    items,
  });
}

export async function ensureCurrentWeeklyNewsletterDraft() {
  const { weekStart, weekEnd } = getPreviousWeekRange();
  return ensureWeeklyNewsletterDraftForRange(weekStart, weekEnd);
}

export async function ensureWeeklyNewsletterDraftForRange(
  weekStart: Date,
  weekEnd: Date,
) {
  const existing = await db.query.newsletterCampaigns.findFirst({
    where: eq(newsletterCampaigns.weekStart, weekStart),
    orderBy: [desc(newsletterCampaigns.createdAt)],
  });
  if (existing) return ok(existing);

  const [generatedError, generated] = await buildWeeklyBOTDGeneratedContent(
    weekStart,
    weekEnd,
  );
  if (generatedError) return err(generatedError);

  try {
    const [created] = await db
      .insert(newsletterCampaigns)
      .values({
        weekStart,
        weekEnd,
        status: "draft",
        subject: `${DEFAULT_WEEKLY_NEWSLETTER_SUBJECT} (${formatWeekRangeLabel(weekStart, weekEnd)})`,
        introText: DEFAULT_WEEKLY_NEWSLETTER_INTRO,
        outroText: DEFAULT_WEEKLY_NEWSLETTER_OUTRO,
        ctaText: DEFAULT_WEEKLY_NEWSLETTER_CTA,
        generatedContent: generated,
      })
      .onConflictDoNothing({
        target: newsletterCampaigns.weekStart,
      })
      .returning();

    if (!created) {
      const campaign = await db.query.newsletterCampaigns.findFirst({
        where: eq(newsletterCampaigns.weekStart, weekStart),
      });
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

export async function listNewsletterCampaigns(limit = 12) {
  return db.query.newsletterCampaigns.findMany({
    orderBy: [desc(newsletterCampaigns.weekStart)],
    limit,
  });
}

export async function getNewsletterCampaignById(campaignId: string) {
  return db.query.newsletterCampaigns.findFirst({
    where: eq(newsletterCampaigns.id, campaignId),
  });
}

export async function deleteNewsletterCampaign(campaignId: string) {
  const campaign = await getNewsletterCampaignById(campaignId);
  if (!campaign) return err({ reason: "Newsletter campaign not found" });
  if (campaign.status === "sent") {
    return err({ reason: "Cannot delete a campaign that has already been sent" });
  }

  try {
    const [row] = await db
      .delete(newsletterCampaigns)
      .where(eq(newsletterCampaigns.id, campaignId))
      .returning();
    if (!row) return err({ reason: "Newsletter campaign not found" });
    return ok(row);
  } catch (e) {
    console.error("deleteNewsletterCampaign", e);
    return err({ reason: "Failed to delete newsletter campaign" });
  }
}

export async function updateNewsletterCampaignDraft(
  campaignId: string,
  patch: {
    subject?: string;
    introText?: string;
    outroText?: string;
    ctaText?: string;
    status?: NewsletterCampaignStatus;
    generatedContent?: WeeklyNewsletterGeneratedContent;
    sentAt?: Date | null;
  },
) {
  const updateData: Partial<typeof newsletterCampaigns.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (patch.subject !== undefined) updateData.subject = patch.subject;
  if (patch.introText !== undefined) updateData.introText = patch.introText;
  if (patch.outroText !== undefined) updateData.outroText = patch.outroText;
  if (patch.ctaText !== undefined) updateData.ctaText = patch.ctaText;
  if (patch.status !== undefined) updateData.status = patch.status;
  if (patch.generatedContent !== undefined)
    updateData.generatedContent = patch.generatedContent;
  if (patch.sentAt !== undefined) updateData.sentAt = patch.sentAt;

  try {
    const [row] = await db
      .update(newsletterCampaigns)
      .set(updateData)
      .where(eq(newsletterCampaigns.id, campaignId))
      .returning();
    if (!row) return err({ reason: "Newsletter campaign not found" });
    return ok(row);
  } catch (e) {
    console.error("updateNewsletterCampaignDraft", e);
    return err({ reason: "Failed to update newsletter campaign" });
  }
}

export async function regenerateCampaignContent(campaignId: string) {
  const campaign = await getNewsletterCampaignById(campaignId);
  if (!campaign) return err({ reason: "Newsletter campaign not found" });
  if (campaign.status === "sent")
    return err({ reason: "Cannot regenerate a sent campaign" });

  const [generatedError, generated] = await buildWeeklyBOTDGeneratedContent(
    campaign.weekStart,
    campaign.weekEnd,
  );
  if (generatedError) return err(generatedError);

  return updateNewsletterCampaignDraft(campaignId, {
    generatedContent: generated,
    status: "draft",
    sentAt: null,
  });
}

export function buildCampaignPreviewHtml(
  campaign: typeof newsletterCampaigns.$inferSelect,
) {
  return renderWeeklyBOTDNewsletterHtml({
    weekStart: campaign.weekStart,
    weekEnd: campaign.weekEnd,
    subject: campaign.subject,
    introText: campaign.introText,
    outroText: campaign.outroText,
    ctaText: campaign.ctaText,
    items: campaign.generatedContent?.items ?? [],
  });
}

export async function getCampaignsByStatusInRange(
  status: NewsletterCampaignStatus,
  from: Date,
  to: Date,
) {
  return db.query.newsletterCampaigns.findMany({
    where: and(
      eq(newsletterCampaigns.status, status),
      gte(newsletterCampaigns.weekStart, from),
      lte(newsletterCampaigns.weekStart, to),
    ),
  });
}
