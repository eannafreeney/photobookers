import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../../../utils";
import AuthModal from "../../../../components/app/AuthModal";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import Alert from "../../../../components/app/Alert";
import { routeParam } from "../../../../lib/routeParam";
import { getPostById } from "../../../../domain/posts/services";
import {
  deletePostLike,
  getPostLikeState,
  insertPostLike,
  userCanLikePost,
} from "../../../../domain/posts/likes";
import PostLikeButton from "../../../../features/collectors/components/PostLikeButton";

export const POST = createRoute(async (c: Context) => {
  const postId = routeParam(c, "postId");
  const user = await getUser(c);

  if (!user?.id) {
    return c.html(<AuthModal action="to like this post." />, 401);
  }

  const [err, post] = await getPostById(postId);
  if (err || !post) return showErrorAlert(c, err?.reason ?? "Post not found");

  if (!(await userCanLikePost(user, post.userId))) {
    return showErrorAlert(c, "Follow to like this post.");
  }

  const body = await c.req.parseBody();
  const isCurrentlyLiked = body.isLiked === "true";

  const [toggleErr] = isCurrentlyLiked
    ? await deletePostLike(user.id, postId)
    : await insertPostLike(user.id, postId);
  if (toggleErr) return showErrorAlert(c, toggleErr.reason);

  const state = await getPostLikeState(postId, user.id);

  return c.html(
    <>
      <Alert
        type="success"
        message={isCurrentlyLiked ? "Like removed." : "Post liked."}
      />
      <PostLikeButton
        postId={postId}
        likedByMe={state.likedByMe}
        likeCount={state.likeCount}
      />
    </>,
  );
});
