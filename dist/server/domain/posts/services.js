import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../../db/client.js";
import { collectorPosts, creators } from "../../db/schema.js";
import { err, ok } from "../../lib/result.js";
import { getPagination } from "../../lib/pagination.js";
async function createPost(userId, input) {
  try {
    const [post] = await db.insert(collectorPosts).values({
      userId,
      body: input.body.trim(),
      imageUrl: input.imageUrl ?? null
    }).returning();
    if (!post) return err({ reason: "Failed to create post" });
    return ok(post);
  } catch (error) {
    console.error("Failed to create post", error);
    return err({ reason: "Failed to create post", error });
  }
}
async function updatePost(postId, userId, input) {
  try {
    const [post] = await db.update(collectorPosts).set({
      body: input.body.trim(),
      ...input.imageUrl !== void 0 ? { imageUrl: input.imageUrl } : {}
    }).where(
      and(eq(collectorPosts.id, postId), eq(collectorPosts.userId, userId))
    ).returning();
    if (!post) return err({ reason: "Post not found" });
    return ok(post);
  } catch (error) {
    console.error("Failed to update post", error);
    return err({ reason: "Failed to update post", error });
  }
}
async function deletePost(postId, userId) {
  try {
    const [post] = await db.delete(collectorPosts).where(
      and(eq(collectorPosts.id, postId), eq(collectorPosts.userId, userId))
    ).returning();
    if (!post) return err({ reason: "Post not found" });
    return ok(post);
  } catch (error) {
    console.error("Failed to delete post", error);
    return err({ reason: "Failed to delete post", error });
  }
}
async function getPostById(postId) {
  try {
    const post = await db.query.collectorPosts.findFirst({
      where: eq(collectorPosts.id, postId)
    });
    if (!post) return err({ reason: "Post not found" });
    return ok(post);
  } catch (error) {
    console.error("Failed to get post", error);
    return err({ reason: "Failed to get post", error });
  }
}
async function listPostsByUserId(userId) {
  try {
    const posts = await db.query.collectorPosts.findMany({
      where: eq(collectorPosts.userId, userId),
      orderBy: [desc(collectorPosts.createdAt)]
    });
    return ok(posts);
  } catch (error) {
    console.error("Failed to list posts", error);
    return err({ reason: "Failed to list posts", error });
  }
}
async function listPostsByCreatorId(creatorId, currentPage = 1, limit = 20) {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      columns: {
        id: true,
        ownerUserId: true,
        displayName: true,
        slug: true,
        coverUrl: true
      }
    });
    if (!creator?.ownerUserId) {
      return err({ reason: "Creator has no owner" });
    }
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(collectorPosts).where(eq(collectorPosts.userId, creator.ownerUserId));
    const { page, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      limit
    );
    const posts = await db.query.collectorPosts.findMany({
      where: eq(collectorPosts.userId, creator.ownerUserId),
      orderBy: [desc(collectorPosts.createdAt)],
      limit,
      offset
    });
    return ok({ posts, creator, totalPages, page, totalCount });
  } catch (error) {
    console.error("Failed to list posts by creator", error);
    return err({ reason: "Failed to list posts", error });
  }
}
async function listPostsByCreatorSlug(slug, currentPage = 1, limit = 20) {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.slug, slug),
      columns: {
        id: true,
        ownerUserId: true,
        displayName: true,
        slug: true,
        coverUrl: true
      }
    });
    if (!creator) return err({ reason: "Creator not found" });
    if (!creator.ownerUserId) return err({ reason: "Creator has no owner" });
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(collectorPosts).where(eq(collectorPosts.userId, creator.ownerUserId));
    const { page, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      limit
    );
    const posts = await db.query.collectorPosts.findMany({
      where: eq(collectorPosts.userId, creator.ownerUserId),
      orderBy: [desc(collectorPosts.createdAt)],
      limit,
      offset
    });
    return ok({ posts, creator, totalPages, page, totalCount });
  } catch (error) {
    console.error("Failed to list posts by creator slug", error);
    return err({ reason: "Failed to list posts", error });
  }
}
async function getPostsDueForFollowerNotification() {
  return db.query.collectorPosts.findMany({
    where: isNull(collectorPosts.notifyFollowersSentAt),
    orderBy: [desc(collectorPosts.createdAt)],
    with: {
      user: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          shelfSlug: true,
          shelfPublic: true,
          profileImageUrl: true
        },
        with: {
          creators: {
            columns: {
              id: true,
              displayName: true,
              slug: true,
              coverUrl: true
            },
            limit: 1
          }
        }
      }
    }
  });
}
async function markPostNotificationsSent(postIds) {
  if (postIds.length === 0) return;
  await db.update(collectorPosts).set({ notifyFollowersSentAt: /* @__PURE__ */ new Date() }).where(inArray(collectorPosts.id, postIds));
}
export {
  createPost,
  deletePost,
  getPostById,
  getPostsDueForFollowerNotification,
  listPostsByCreatorId,
  listPostsByCreatorSlug,
  listPostsByUserId,
  markPostNotificationsSent,
  updatePost
};
