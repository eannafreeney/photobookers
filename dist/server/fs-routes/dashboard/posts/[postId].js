import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils.js";
import { isFeatureEnabledForUser } from "../../../lib/features.js";
import { showErrorAlert } from "../../../lib/alertHelpers.js";
import Alert from "../../../components/app/Alert.js";
import {
  deleteCollectorPost,
  findCollectorPost,
  listCollectorPosts
} from "../../../db/queries.js";
import { CollectorPostsTableBody } from "../../../features/collectors/components/CollectorPostsTable.js";
import { routeParam } from "../../../lib/routeParam.js";
const DELETE = createRoute(async (c) => {
  const user = await getUser(c);
  const postId = routeParam(c, "postId");
  if (!user?.id || !isFeatureEnabledForUser("collectors", user)) {
    return showErrorAlert(c, "You can't do that.");
  }
  const post = await findCollectorPost(postId);
  if (!post || post.userId !== user.id && !user.isAdmin) {
    return showErrorAlert(c, "Post not found");
  }
  try {
    await deleteCollectorPost(postId);
  } catch (error) {
    console.error("Failed to delete collector post", error);
    return showErrorAlert(c, "Failed to delete post");
  }
  const posts = await listCollectorPosts(post.userId);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Post deleted." }),
      /* @__PURE__ */ jsx(CollectorPostsTableBody, { posts })
    ] })
  );
});
export {
  DELETE
};
