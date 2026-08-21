import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import AuthModal from "../../../../components/app/AuthModal.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import Alert from "../../../../components/app/Alert.js";
import { routeParam } from "../../../../lib/routeParam.js";
import { getPostById } from "../../../../domain/posts/services.js";
import {
  deletePostLike,
  getPostLikeState,
  insertPostLike,
  userCanLikePost
} from "../../../../domain/posts/likes.js";
import PostLikeButton from "../../../../features/collectors/components/PostLikeButton.js";
const POST = createRoute(async (c) => {
  const postId = routeParam(c, "postId");
  const user = await getUser(c);
  if (!user?.id) {
    return c.html(/* @__PURE__ */ jsx(AuthModal, { action: "to like this post." }), 401);
  }
  const [err, post] = await getPostById(postId);
  if (err || !post) return showErrorAlert(c, err?.reason ?? "Post not found");
  if (!await userCanLikePost(user, post.userId)) {
    return showErrorAlert(c, "Follow to like this post.");
  }
  const body = await c.req.parseBody();
  const isCurrentlyLiked = body.isLiked === "true";
  const [toggleErr] = isCurrentlyLiked ? await deletePostLike(user.id, postId) : await insertPostLike(user.id, postId);
  if (toggleErr) return showErrorAlert(c, toggleErr.reason);
  const state = await getPostLikeState(postId, user.id);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: isCurrentlyLiked ? "Like removed." : "Post liked."
        }
      ),
      /* @__PURE__ */ jsx(
        PostLikeButton,
        {
          postId,
          likedByMe: state.likedByMe,
          likeCount: state.likeCount
        }
      )
    ] })
  );
});
export {
  POST
};
