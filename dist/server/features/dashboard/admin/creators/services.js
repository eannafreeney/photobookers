import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  or,
  sql
} from "drizzle-orm";
import { db } from "../../../../db/client.js";
import {
  creatorInterviews,
  creators,
  users
} from "../../../../db/schema.js";
import { getRandomCoverUrl, slugify } from "../../../../utils.js";
import { getCreatorById } from "../../creators/services.js";
import { getPagination } from "../../../../lib/pagination.js";
import { err, ok } from "../../../../lib/result.js";
import { createNewPublisherNotification } from "../notifications/utils.js";
import { getBooksByCreatorId } from "../../../../domain/creators/books.js";
import {
  getInterviewByToken,
  completeInterviewByToken
} from "../../../../domain/interviews/token.js";
import { invalidateCreatorCache } from "../../../app/services.js";
const removeCreatorOwnerAdminDB = async (creatorId) => {
  try {
    const [updatedCreator] = await db.update(creators).set({
      ownerUserId: null,
      status: "stub",
      verifiedAt: null
    }).where(eq(creators.id, creatorId)).returning();
    if (!updatedCreator) {
      return err({ reason: "Creator not found", cause: void 0 });
    }
    return ok(updatedCreator);
  } catch (error) {
    console.error("Failed to remove creator owner", error);
    return err({ reason: "Failed to remove creator owner", cause: error });
  }
};
const getAllUserProfilesAdmin = async () => {
  try {
    const rows = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName
    }).from(users).leftJoin(creators, eq(creators.ownerUserId, users.id)).where(isNull(creators.id));
    return ok(rows ?? []);
  } catch (error) {
    console.error("Failed to get all user profiles", error);
    return err({ reason: "Failed to get all user profiles", cause: error });
  }
};
const getAllCreatorProfilesByTypeAdmin = async (searchQuery, currentPage = 1, type = void 0) => {
  let creatorIds = [];
  if (searchQuery) {
    const rows = await db.select({ id: creators.id }).from(creators).where(ilike(creators.displayName, `%${searchQuery}%`));
    creatorIds = rows.map((r) => r.id);
  }
  const searchCondition = searchQuery && searchQuery.trim() !== "" ? ilike(creators.displayName, `%${searchQuery}%`) : void 0;
  const typeCondition = type ? eq(creators.type, type) : void 0;
  const whereCondition = searchCondition && typeCondition ? searchCondition && typeCondition : searchCondition ?? typeCondition ?? void 0;
  const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(creators).where(whereCondition);
  const { page, limit, offset, totalPages } = getPagination(
    currentPage,
    totalCount,
    20
  );
  const foundCreators = await db.query.creators.findMany({
    where: whereCondition,
    offset,
    limit
  });
  return { creators: foundCreators, totalPages, page };
};
const getAllCreatorProfiles = async () => {
  try {
    const foundCreators = await db.query.creators.findMany({
      where: isNull(creators.ownerUserId),
      orderBy: (creators2, { asc }) => [asc(creators2.displayName)]
    });
    return ok(foundCreators ?? []);
  } catch (error) {
    console.error("Failed to get all creator profiles", error);
    return err({ reason: "Failed to get all creator profiles", cause: error });
  }
};
const getCreatorByIdAdmin = async (creatorId) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      with: {
        booksAsArtist: true,
        booksAsPublisher: true
      }
    });
    return ok(creator ?? null);
  } catch (error) {
    console.error("Failed to get creator by id", error);
    return err({ reason: "Failed to get creator by id", cause: error });
  }
};
const createStubCreatorProfileAdmin = async (displayName, userId, type, website, email) => {
  const [creatorError, newCreator] = await createCreatorProfileAdmin({
    displayName: displayName.trim(),
    slug: slugify(displayName),
    coverUrl: getRandomCoverUrl(),
    ownerUserId: null,
    type,
    status: "stub",
    createdByUserId: userId,
    website: website || null,
    email: email || null
  });
  if (creatorError || !newCreator)
    return err({ reason: "Failed to create artist" });
  return ok(newCreator);
};
const createStubCreatorProfile = async (displayName, userId, type) => {
  const trimmed = displayName.trim();
  if (!trimmed || trimmed.length < 2) {
    return err({
      reason: `${type === "artist" ? "Artist" : "Publisher"} name must be at least 2 characters`
    });
  }
  if (trimmed.length > 100) {
    return err({
      reason: `${type === "artist" ? "Artist" : "Publisher"} name must be less than 100 characters`
    });
  }
  if (trimmed.match(/^[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/)) {
    return err({
      reason: `${type === "artist" ? "Artist" : "Publisher"} name cannot start with special characters`
    });
  }
  const suspiciousNames = ["unknown", "n/a", "none", "test", "tbd", "pending", "various", "multiple"];
  const lowerName = trimmed.toLowerCase();
  if (suspiciousNames.includes(lowerName)) {
    return err({
      reason: `Please provide a specific ${type === "artist" ? "artist" : "publisher"} name`
    });
  }
  try {
    const oneHourAgo = new Date(Date.now() - 36e5);
    const recentStubs = await db.select({ count: sql`count(*)` }).from(creators).where(
      and(
        eq(creators.createdByUserId, userId),
        eq(creators.status, "stub"),
        gte(creators.createdAt, oneHourAgo)
      )
    );
    const stubCount = recentStubs[0]?.count ?? 0;
    const MAX_STUBS_PER_HOUR = 50;
    if (stubCount >= MAX_STUBS_PER_HOUR) {
      return err({
        reason: `Too many ${type}s created recently. Please try again later or contact support.`
      });
    }
  } catch (error) {
    console.error("Failed to check stub creation rate limit:", error);
  }
  const [creatorError, newCreator] = await createCreatorProfileAdmin({
    displayName: trimmed,
    slug: slugify(trimmed),
    coverUrl: getRandomCoverUrl(),
    ownerUserId: null,
    type,
    status: "stub",
    createdByUserId: userId,
    website: null,
    email: null
  });
  if (creatorError || !newCreator) {
    return err({
      reason: `Failed to create ${type === "artist" ? "artist" : "publisher"} profile: ${creatorError?.reason ?? "unknown error"}`
    });
  }
  return ok(newCreator);
};
const findCreatorByDisplayName = async (displayName, type) => {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return ok(null);
  }
  try {
    const existing = await db.select().from(creators).where(sql`LOWER(${creators.displayName}) = LOWER(${trimmed})`).limit(10);
    const match = existing.find((c) => c.type === type) ?? null;
    return ok(match);
  } catch (error) {
    console.error("Failed to find creator by display name", error);
    return err({ reason: "Failed to find creator", cause: error });
  }
};
const createCreatorProfileAdmin = async (input) => {
  try {
    const parts = input.displayName.trim().split(/\s+/);
    const sortName = parts[parts.length - 1];
    const [newCreator] = await db.insert(creators).values({
      ...input,
      sortName
    }).returning();
    if (!newCreator) return err({ reason: "Failed to create creator" });
    return ok(newCreator);
  } catch (error) {
    console.error("Failed to create artist", error);
    return err({ reason: "Failed to create artist", cause: error });
  }
};
const deleteCreatorByIdAdmin = async (creatorId) => {
  try {
    const [deletedCreator] = await db.delete(creators).where(eq(creators.id, creatorId)).returning();
    if (!deletedCreator)
      return err({ reason: "Creator not found", cause: void 0 });
    if (deletedCreator?.slug) {
      invalidateCreatorCache(deletedCreator.slug);
    }
    return ok(deletedCreator);
  } catch (error) {
    console.error("Failed to delete creator", error);
    return err({ reason: "Failed to delete creator", cause: error });
  }
};
const updateCreatorProfileAdmin = async (input, creatorId) => {
  try {
    const { id, slug, ownerUserId, createdAt, ...updateableFields } = input;
    const parts = updateableFields.displayName?.trim().split(/\s+/) ?? [];
    const sortName = parts.length > 0 ? parts[parts.length - 1] : void 0;
    const cleanedInput = {
      ...updateableFields,
      sortName,
      website: updateableFields.website || null,
      facebook: updateableFields.facebook || null,
      twitter: updateableFields.twitter || null,
      instagram: updateableFields.instagram || null,
      email: updateableFields.email || null,
      updatedAt: /* @__PURE__ */ new Date()
    };
    const [updatedCreator] = await db.update(creators).set(cleanedInput).where(eq(creators.id, creatorId)).returning();
    if (updatedCreator?.slug) {
      invalidateCreatorCache(updatedCreator.slug);
    }
    return updatedCreator;
  } catch (error) {
    console.error("Failed to update artist", error);
    return null;
  }
};
const findUserByEmailAdmin = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    return user ?? null;
  } catch (error) {
    console.error("Failed to find user by email", error);
    return null;
  }
};
const getAllCreatorOptions = async (creatorType) => {
  const foundCreators = await db.query.creators.findMany({
    where: eq(creators.type, creatorType),
    orderBy: (creators2, { asc }) => [asc(creators2.sortName)]
  });
  return foundCreators?.map((creator) => ({
    id: creator.id,
    label: creator.displayName
  })) ?? [];
};
const resolveArtist = async (formData, userId) => {
  const { artist_id, new_artist_name } = formData;
  if (!artist_id && !new_artist_name)
    return err({ reason: "No artist selected" });
  if (artist_id) {
    const [error, creator] = await getCreatorById(artist_id);
    if (error || !creator) return err({ reason: "Invalid artist" });
    if (creator.type !== "artist")
      return err({ reason: "Creator is not an artist" });
    return ok(creator);
  }
  const [stubError, stubArtist] = await createStubCreatorProfileAdmin(
    new_artist_name,
    userId,
    "artist"
  );
  if (stubError || !stubArtist)
    return err({ reason: "Failed to create artist" });
  if (stubArtist.type !== "artist")
    return err({ reason: "Created creator is not an artist" });
  return ok(stubArtist);
};
const resolvePublisher = async (formData, user) => {
  const { publisher_id, new_publisher_name } = formData;
  if (!publisher_id && !new_publisher_name) {
    return ok(null);
  }
  if (publisher_id) {
    const [error, creator] = await getCreatorById(publisher_id);
    if (error || !creator) return err({ reason: "Invalid publisher" });
    if (creator.type !== "publisher")
      return err({ reason: "Creator is not a publisher" });
    return ok(creator);
  }
  const [stubError, stubPublisher] = await createStubCreatorProfileAdmin(
    new_publisher_name,
    user.id,
    "publisher"
  );
  if (stubError || !stubPublisher)
    return err({ reason: "Failed to create publisher" });
  if (stubPublisher.type !== "publisher")
    return err({ reason: "Created creator is not a publisher" });
  await createNewPublisherNotification(user, stubPublisher);
  return ok(stubPublisher);
};
const markWelcomeEmailSentAdmin = async (creatorId) => {
  try {
    const [row] = await db.update(creators).set({ welcomeEmailSent: /* @__PURE__ */ new Date() }).where(eq(creators.id, creatorId)).returning();
    return ok(row);
  } catch (error) {
    console.error("Failed to mark welcome email sent", error);
    return err({ reason: "Failed to mark welcome email sent", cause: error });
  }
};
const getCreatorRecipientEmailAdmin = async (creatorId) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      with: { owner: true }
    });
    if (!creator) return err({ reason: "Creator not found" });
    return ok({
      creator,
      recipientEmail: creator.email ?? creator.owner?.email ?? null
    });
  } catch (error) {
    console.error("Failed to get creator recipient email", error);
    return err({
      reason: "Failed to get creator recipient email",
      cause: error
    });
  }
};
const createCreatorInterviewInviteAdmin = async (input) => {
  try {
    const [row] = await db.insert(creatorInterviews).values({
      creatorId: input.creatorId,
      creatorSlug: input.creatorSlug,
      recipientEmail: input.recipientEmail,
      invitedByUserId: input.invitedByUserId,
      inviteToken: input.inviteToken,
      interviewType: input.interviewType ?? "introduction",
      bookId: input.bookId ?? null,
      status: "sent",
      invitedAt: /* @__PURE__ */ new Date()
    }).returning();
    return ok(row);
  } catch (error) {
    return err({ reason: "Failed to create interview invite", cause: error });
  }
};
const getAdminCreatorInterviews = async (currentPage = 1, searchQuery, statusType) => {
  try {
    const normalizedSearch = searchQuery?.trim();
    const hasSearch = !!normalizedSearch;
    let creatorIds = [];
    if (hasSearch) {
      const rows = await db.select({ id: creators.id }).from(creators).where(ilike(creators.displayName, `%${normalizedSearch}%`));
      creatorIds = rows.map((r) => r.id);
    }
    const searchCondition = hasSearch ? or(
      ilike(creatorInterviews.recipientEmail, `%${normalizedSearch}%`),
      creatorIds.length > 0 ? inArray(creatorInterviews.creatorId, creatorIds) : void 0
    ) : void 0;
    const statusCondition = statusType ? eq(creatorInterviews.status, statusType) : void 0;
    const whereCondition = searchCondition && statusCondition ? and(searchCondition, statusCondition) : searchCondition ?? statusCondition ?? void 0;
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(creatorInterviews).where(whereCondition);
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      30
    );
    const interviews = await db.query.creatorInterviews.findMany({
      where: whereCondition,
      orderBy: [desc(creatorInterviews.invitedAt)],
      with: { creator: true },
      limit,
      offset
    });
    return ok({ interviews, page, totalPages });
  } catch (error) {
    return err({
      reason: "Failed to get admin creator interviews",
      cause: error
    });
  }
};
const markInterviewEmailSentAdmin = async (creatorId) => {
  try {
    const [row] = await db.update(creators).set({ interviewEmailSent: /* @__PURE__ */ new Date() }).where(eq(creators.id, creatorId)).returning();
    return ok(row);
  } catch (error) {
    return err({ reason: "Failed to mark interview email sent", cause: error });
  }
};
const updateCreatorEmail = async (creatorId, email) => {
  try {
    const [row] = await db.update(creators).set({ email }).where(eq(creators.id, creatorId)).returning();
    if (!row) return err({ reason: "Creator not found" });
    return ok(row);
  } catch (error) {
    return err({ reason: "Failed to update creator email", cause: error });
  }
};
export {
  completeInterviewByToken,
  createCreatorInterviewInviteAdmin,
  createCreatorProfileAdmin,
  createStubCreatorProfile,
  createStubCreatorProfileAdmin,
  deleteCreatorByIdAdmin,
  findCreatorByDisplayName,
  findUserByEmailAdmin,
  getAdminCreatorInterviews,
  getAllCreatorOptions,
  getAllCreatorProfiles,
  getAllCreatorProfilesByTypeAdmin,
  getAllUserProfilesAdmin,
  getBooksByCreatorId,
  getCreatorByIdAdmin,
  getCreatorRecipientEmailAdmin,
  getInterviewByToken,
  markInterviewEmailSentAdmin,
  markWelcomeEmailSentAdmin,
  removeCreatorOwnerAdminDB,
  resolveArtist,
  resolvePublisher,
  updateCreatorEmail,
  updateCreatorProfileAdmin
};
