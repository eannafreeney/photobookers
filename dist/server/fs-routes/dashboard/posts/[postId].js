import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils.js";
import { showErrorAlert } from "../../../lib/alertHelpers.js";
import Alert from "../../../components/app/Alert.js";
import Modal from "../../../components/app/Modal.js";
import { deletePostById, findPost } from "../../../db/queries.js";
import { updatePost } from "../../../domain/posts/services.js";
import { POST_BODY_MAX_LENGTH } from "../../../domain/posts/utils.js";
import PostForm from "../../../features/collectors/components/PostForm.js";
import { routeParam } from "../../../lib/routeParam.js";
import { dispatchEvents } from "../../../lib/disatchEvents.js";
import { removeInvalidImages, uploadImage } from "../../../services/storage.js";
function canEditPost(user) {
  return Boolean(user?.id);
}
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const postId = routeParam(c, "postId");
  if (!canEditPost(user) || !user?.id) {
    return c.html(
      /* @__PURE__ */ jsx(Modal, { title: "Edit post", children: /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "Post not found." }) })
    );
  }
  const post = await findPost(postId);
  if (!post || post.userId !== user.id) {
    return c.html(
      /* @__PURE__ */ jsx(Modal, { title: "Edit post", children: /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "Post not found." }) })
    );
  }
  return c.html(
    /* @__PURE__ */ jsx(Modal, { title: "Edit post", maxWidth: "max-w-2xl", children: /* @__PURE__ */ jsx(
      PostForm,
      {
        postId: post.id,
        initialBody: post.body,
        initialImageUrl: post.imageUrl
      }
    ) })
  );
});
const PATCH = createRoute(async (c) => {
  const user = await getUser(c);
  const postId = routeParam(c, "postId");
  if (!canEditPost(user) || !user?.id) {
    return showErrorAlert(c, "You can't do that.");
  }
  const post = await findPost(postId);
  if (!post || post.userId !== user.id) {
    return showErrorAlert(c, "Post not found");
  }
  const body = await c.req.parseBody({ all: true });
  const postBody = String(body.body ?? "").trim();
  if (!postBody) {
    return showErrorAlert(c, "Post text is required");
  }
  if (postBody.length > POST_BODY_MAX_LENGTH) {
    return showErrorAlert(
      c,
      `Post is too long (max ${POST_BODY_MAX_LENGTH} characters)`
    );
  }
  const rawImage = body.image;
  if (Array.isArray(rawImage)) {
    return showErrorAlert(c, "Only one image is allowed per post");
  }
  let imageUrl = void 0;
  if (rawImage instanceof File && rawImage.size > 0) {
    if (!removeInvalidImages(rawImage)) {
      return showErrorAlert(c, "Please upload a valid image file");
    }
    try {
      const uploaded = await uploadImage(
        rawImage,
        `users/${user.id}/posts`,
        "gallery"
      );
      imageUrl = uploaded.url;
    } catch (error) {
      console.error("post image upload failed", error);
      return showErrorAlert(c, "Failed to upload image");
    }
  }
  const [err] = await updatePost(postId, user.id, {
    body: postBody,
    ...imageUrl !== void 0 ? { imageUrl } : {}
  });
  if (err) return showErrorAlert(c, err.reason);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Post updated." }),
      dispatchEvents(["posts:updated"]),
      /* @__PURE__ */ jsx("div", { id: "modal-root" })
    ] })
  );
});
const DELETE = createRoute(async (c) => {
  const user = await getUser(c);
  const postId = routeParam(c, "postId");
  if (!user?.id) {
    return showErrorAlert(c, "You can't do that.");
  }
  const post = await findPost(postId);
  if (!post || post.userId !== user.id && !user.isAdmin) {
    return showErrorAlert(c, "Post not found");
  }
  try {
    await deletePostById(postId);
  } catch (error) {
    console.error("Failed to delete post", error);
    return showErrorAlert(c, "Failed to delete post");
  }
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Post deleted." }),
      dispatchEvents(["posts:updated"])
    ] })
  );
});
export {
  DELETE,
  GET,
  PATCH
};
