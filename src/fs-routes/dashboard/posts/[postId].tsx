import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils";
import { isFeatureEnabledForUser } from "../../../lib/features";
import { showErrorAlert } from "../../../lib/alertHelpers";
import Alert from "../../../components/app/Alert";
import {
  deleteCollectorPost,
  findCollectorPost,
  listCollectorPosts,
} from "../../../db/queries";
import { CollectorPostsTableBody } from "../../../features/collectors/components/CollectorPostsTable";
import { routeParam } from "../../../lib/routeParam";

export const DELETE = createRoute(async (c) => {
  const user = await getUser(c);
  const postId = routeParam(c, "postId");

  if (!user?.id || !isFeatureEnabledForUser("collectors", user)) {
    return showErrorAlert(c, "You can't do that.");
  }

  const post = await findCollectorPost(postId);
  // Owner or admin (moderation) only; otherwise treat as not found.
  if (!post || (post.userId !== user.id && !user.isAdmin)) {
    return showErrorAlert(c, "Post not found");
  }

  try {
    await deleteCollectorPost(postId);
  } catch (error) {
    console.error("Failed to delete collector post", error);
    return showErrorAlert(c, "Failed to delete post");
  }

  // Refresh the post owner's list (correct whether the actor is owner or admin).
  const posts = await listCollectorPosts(post.userId);

  return c.html(
    <>
      <Alert type="success" message="Post deleted." />
      <CollectorPostsTableBody posts={posts} />
    </>,
  );
});
