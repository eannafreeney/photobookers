import { customAlphabet } from "nanoid";
import { eq } from "drizzle-orm";
import { bookFairs, books, creatorInterviews, creators } from "../../src/db/schema";
import { getE2eDb } from "./db";

const e2eSlugId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);
const e2eTokenId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 32);

export type SeedStubCreator = {
  id: string;
  slug: string;
  website: string | null;
};

export type SeedPublishedBook = {
  id: string;
  slug: string;
  title: string;
  artistId: string;
};

export type SeedDraftApprovedBook = SeedPublishedBook;

export async function seedStubCreator(opts: {
  createdByUserId: string;
  website?: string | null;
  displayName?: string;
}): Promise<SeedStubCreator> {
  const slug = `e2e-claim-${e2eSlugId()}`;
  const displayName = opts.displayName ?? `E2E Claim Artist ${slug.slice(-6)}`;
  const website = opts.website ?? null;

  const [creator] = await getE2eDb()
    .insert(creators)
    .values({
      slug,
      displayName,
      type: "artist",
      status: "stub",
      website,
      createdByUserId: opts.createdByUserId,
    })
    .returning({
      id: creators.id,
      slug: creators.slug,
      website: creators.website,
    });

  if (!creator) throw new Error("Failed to seed stub creator");

  return creator;
}

export async function seedVerifiedCreator(opts: {
  ownerUserId: string;
  createdByUserId: string;
  displayName?: string;
}): Promise<SeedStubCreator> {
  const creator = await seedStubCreator({
    createdByUserId: opts.createdByUserId,
    displayName: opts.displayName,
  });

  await getE2eDb()
    .update(creators)
    .set({
      status: "verified",
      ownerUserId: opts.ownerUserId,
      verifiedAt: new Date(),
    })
    .where(eq(creators.id, creator.id));

  return creator;
}

export async function seedPublishedBook(opts: {
  createdByUserId: string;
  artistId: string;
  title?: string;
  tags?: string[];
}): Promise<SeedPublishedBook> {
  const slug = `e2e-book-${e2eSlugId()}`;
  const title = opts.title ?? `E2E Book ${slug.slice(-6)}`;

  const [book] = await getE2eDb()
    .insert(books)
    .values({
      slug,
      title,
      artistId: opts.artistId,
      createdByUserId: opts.createdByUserId,
      approvalStatus: "approved",
      publicationStatus: "published",
      coverUrl: "https://example.com/cover.jpg",
      tags: opts.tags ?? ["urban"],
    })
    .returning({
      id: books.id,
      slug: books.slug,
      title: books.title,
      artistId: books.artistId,
    });

  if (!book?.artistId) throw new Error("Failed to seed published book");

  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    artistId: book.artistId,
  };
}

export async function seedDraftApprovedBook(opts: {
  createdByUserId: string;
  artistId: string;
  title?: string;
  tags?: string[];
}): Promise<SeedDraftApprovedBook> {
  const slug = `e2e-book-${e2eSlugId()}`;
  const title = opts.title ?? `E2E Draft ${slug.slice(-6)}`;

  const [book] = await getE2eDb()
    .insert(books)
    .values({
      slug,
      title,
      artistId: opts.artistId,
      createdByUserId: opts.createdByUserId,
      approvalStatus: "approved",
      publicationStatus: "draft",
      coverUrl: "https://example.com/cover.jpg",
      tags: opts.tags ?? ["urban"],
    })
    .returning({
      id: books.id,
      slug: books.slug,
      title: books.title,
      artistId: books.artistId,
    });

  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    artistId: book.artistId,
  };
}

export type SeedPublishedFair = {
  id: string;
  slug: string;
  name: string;
};

export async function seedPublishedFair(opts: {
  createdByUserId: string;
  name?: string;
}): Promise<SeedPublishedFair> {
  const slug = `e2e-fair-${e2eSlugId()}`;
  const name = opts.name ?? `E2E Fair ${slug.slice(-6)}`;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 30);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 33);

  const [fair] = await getE2eDb()
    .insert(bookFairs)
    .values({
      slug,
      name,
      description: "E2E fair smoke test",
      city: "Berlin",
      country: "DE",
      startDate,
      endDate,
      status: "published",
      approvalStatus: "approved",
      createdByUserId: opts.createdByUserId,
    })
    .returning({
      id: bookFairs.id,
      slug: bookFairs.slug,
      name: bookFairs.name,
    });

  if (!fair) throw new Error("Failed to seed published fair");

  return fair;
}

export type SeedInterviewInvite = {
  id: string;
  inviteToken: string;
  creatorId: string;
};

export async function seedInterviewInvite(opts: {
  creatorId: string;
  creatorSlug: string;
  invitedByUserId: string;
  recipientEmail?: string;
}): Promise<SeedInterviewInvite> {
  const inviteToken = e2eTokenId();

  const [interview] = await getE2eDb()
    .insert(creatorInterviews)
    .values({
      creatorId: opts.creatorId,
      creatorSlug: opts.creatorSlug,
      recipientEmail: opts.recipientEmail ?? `e2e-interview-${e2eSlugId()}@example.com`,
      inviteToken,
      invitedByUserId: opts.invitedByUserId,
      status: "sent",
      interviewType: "introduction",
    })
    .returning({
      id: creatorInterviews.id,
      inviteToken: creatorInterviews.inviteToken,
      creatorId: creatorInterviews.creatorId,
    });

  if (!interview) throw new Error("Failed to seed interview invite");

  return interview;
}
