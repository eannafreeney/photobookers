import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../../db/client.js";
import { posts, creators } from "../../db/schema.js";
import { err, ok } from "../../lib/result.js";
import { getPagination } from "../../lib/pagination.js";
import { POST_BODY_MAX_LENGTH } from "./utils.js";
const tooLong = () => err({ reason: `Post is too long (max ${POST_BODY_MAX_LENGTH} characters)` });
async function createPost(userId, input) {
  const body = input.body.trim();
  if (body.length > POST_BODY_MAX_LENGTH) return tooLong();
  try {
    const [post] = await db.insert(posts).values({
      userId,
      body,
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
  const body = input.body.trim();
  if (body.length > POST_BODY_MAX_LENGTH) return tooLong();
  try {
    const [post] = await db.update(posts).set({
      body,
      ...input.imageUrl !== void 0 ? { imageUrl: input.imageUrl } : {}
    }).where(
      and(eq(posts.id, postId), eq(posts.userId, userId))
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
    const [post] = await db.delete(posts).where(
      and(eq(posts.id, postId), eq(posts.userId, userId))
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
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId)
    });
    if (!post) return err({ reason: "Post not found" });
    return ok(post);
  } catch (error) {
    console.error("Failed to get post", error);
    return err({ reason: "Failed to get post", error });
  }
}
async function getPublicPostById(postId) {
  try {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      with: {
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            shelfSlug: true,
            profileImageUrl: true
          }
        }
      }
    });
    if (!post) return err({ reason: "Post not found" });
    const creator = await db.query.creators.findFirst({
      where: eq(creators.ownerUserId, post.userId),
      columns: {
        id: true,
        slug: true,
        displayName: true,
        coverUrl: true
      }
    });
    return ok({
      post,
      author: post.user,
      creator
    });
  } catch (error) {
    console.error("Failed to get public post", error);
    return err({ reason: "Failed to get post", error });
  }
}
async function listPostsByUserId(userId) {
  try {
    const rows = await db.query.posts.findMany({
      where: eq(posts.userId, userId),
      orderBy: [desc(posts.createdAt)]
    });
    return ok(rows);
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
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(posts).where(eq(posts.userId, creator.ownerUserId));
    const { page, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      limit
    );
    const rows = await db.query.posts.findMany({
      where: eq(posts.userId, creator.ownerUserId),
      orderBy: [desc(posts.createdAt)],
      limit,
      offset
    });
    return ok({ posts: rows, creator, totalPages, page, totalCount });
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
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(posts).where(eq(posts.userId, creator.ownerUserId));
    const { page, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      limit
    );
    const rows = await db.query.posts.findMany({
      where: eq(posts.userId, creator.ownerUserId),
      orderBy: [desc(posts.createdAt)],
      limit,
      offset
    });
    return ok({ posts: rows, creator, totalPages, page, totalCount });
  } catch (error) {
    console.error("Failed to list posts by creator slug", error);
    return err({ reason: "Failed to list posts", error });
  }
}
async function getPostsDueForFollowerNotification() {
  return db.query.posts.findMany({
    where: isNull(posts.notifyFollowersSentAt),
    orderBy: [desc(posts.createdAt)],
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
  await db.update(posts).set({ notifyFollowersSentAt: /* @__PURE__ */ new Date() }).where(inArray(posts.id, postIds));
}
export {
  createPost,
  deletePost,
  getPostById,
  getPostsDueForFollowerNotification,
  getPublicPostById,
  listPostsByCreatorId,
  listPostsByCreatorSlug,
  listPostsByUserId,
  markPostNotificationsSent,
  updatePost
};
