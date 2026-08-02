import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../../db/client";
import { collectorPosts, creators } from "../../db/schema";
import { err, ok } from "../../lib/result";
import { getPagination } from "../../lib/pagination";

export async function createPost(
  userId: string,
  input: { body: string; imageUrl?: string | null },
) {
  try {
    const [post] = await db
      .insert(collectorPosts)
      .values({
        userId,
        body: input.body.trim(),
        imageUrl: input.imageUrl ?? null,
      })
      .returning();
    if (!post) return err({ reason: "Failed to create post" });
    return ok(post);
  } catch (error) {
    console.error("Failed to create post", error);
    return err({ reason: "Failed to create post", error });
  }
}

export async function updatePost(
  postId: string,
  userId: string,
  input: { body: string; imageUrl?: string | null },
) {
  try {
    const [post] = await db
      .update(collectorPosts)
      .set({
        body: input.body.trim(),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      })
      .where(
        and(eq(collectorPosts.id, postId), eq(collectorPosts.userId, userId)),
      )
      .returning();
    if (!post) return err({ reason: "Post not found" });
    return ok(post);
  } catch (error) {
    console.error("Failed to update post", error);
    return err({ reason: "Failed to update post", error });
  }
}

export async function deletePost(postId: string, userId: string) {
  try {
    const [post] = await db
      .delete(collectorPosts)
      .where(
        and(eq(collectorPosts.id, postId), eq(collectorPosts.userId, userId)),
      )
      .returning();
    if (!post) return err({ reason: "Post not found" });
    return ok(post);
  } catch (error) {
    console.error("Failed to delete post", error);
    return err({ reason: "Failed to delete post", error });
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await db.query.collectorPosts.findFirst({
      where: eq(collectorPosts.id, postId),
    });
    if (!post) return err({ reason: "Post not found" });
    return ok(post);
  } catch (error) {
    console.error("Failed to get post", error);
    return err({ reason: "Failed to get post", error });
  }
}

export async function listPostsByUserId(userId: string) {
  try {
    const posts = await db.query.collectorPosts.findMany({
      where: eq(collectorPosts.userId, userId),
      orderBy: [desc(collectorPosts.createdAt)],
    });
    return ok(posts);
  } catch (error) {
    console.error("Failed to list posts", error);
    return err({ reason: "Failed to list posts", error });
  }
}

/** Posts for a creator profile — authored by the creator's owner user. */
export async function listPostsByCreatorId(
  creatorId: string,
  currentPage = 1,
  limit = 20,
) {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      columns: {
        id: true,
        ownerUserId: true,
        displayName: true,
        slug: true,
        coverUrl: true,
      },
    });
    if (!creator?.ownerUserId) {
      return err({ reason: "Creator has no owner" });
    }

    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(collectorPosts)
      .where(eq(collectorPosts.userId, creator.ownerUserId));

    const { page, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      limit,
    );

    const posts = await db.query.collectorPosts.findMany({
      where: eq(collectorPosts.userId, creator.ownerUserId),
      orderBy: [desc(collectorPosts.createdAt)],
      limit,
      offset,
    });

    return ok({ posts, creator, totalPages, page, totalCount });
  } catch (error) {
    console.error("Failed to list posts by creator", error);
    return err({ reason: "Failed to list posts", error });
  }
}

export async function listPostsByCreatorSlug(
  slug: string,
  currentPage = 1,
  limit = 20,
) {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.slug, slug),
      columns: {
        id: true,
        ownerUserId: true,
        displayName: true,
        slug: true,
        coverUrl: true,
      },
    });
    if (!creator) return err({ reason: "Creator not found" });
    if (!creator.ownerUserId) return err({ reason: "Creator has no owner" });

    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(collectorPosts)
      .where(eq(collectorPosts.userId, creator.ownerUserId));

    const { page, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      limit,
    );

    const posts = await db.query.collectorPosts.findMany({
      where: eq(collectorPosts.userId, creator.ownerUserId),
      orderBy: [desc(collectorPosts.createdAt)],
      limit,
      offset,
    });

    return ok({ posts, creator, totalPages, page, totalCount });
  } catch (error) {
    console.error("Failed to list posts by creator slug", error);
    return err({ reason: "Failed to list posts", error });
  }
}

export async function getPostsDueForFollowerNotification() {
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
          profileImageUrl: true,
        },
        with: {
          creators: {
            columns: {
              id: true,
              displayName: true,
              slug: true,
              coverUrl: true,
            },
            limit: 1,
          },
        },
      },
    },
  });
}

export async function markPostNotificationsSent(postIds: string[]) {
  if (postIds.length === 0) return;
  await db
    .update(collectorPosts)
    .set({ notifyFollowersSentAt: new Date() })
    .where(inArray(collectorPosts.id, postIds));
}
