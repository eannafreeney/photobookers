import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils";
import { showErrorAlert } from "../../../lib/alertHelpers";
import Alert from "../../../components/app/Alert";
import Modal from "../../../components/app/Modal";
import { deleteCollectorPost, findCollectorPost } from "../../../db/queries";
import { updatePost } from "../../../domain/posts/services";
import { POST_BODY_MAX_LENGTH } from "../../../domain/posts/utils";
import CollectorPostForm from "../../../features/collectors/components/CollectorPostForm";
import { routeParam } from "../../../lib/routeParam";
import { dispatchEvents } from "../../../lib/disatchEvents";
import { removeInvalidImages, uploadImage } from "../../../services/storage";

function canEditPost(user: Awaited<ReturnType<typeof getUser>>) {
  return Boolean(user?.id);
}

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const postId = routeParam(c, "postId");

  if (!canEditPost(user) || !user?.id) {
    return c.html(
      <Modal title="Edit post">
        <p class="text-sm text-on-surface">Post not found.</p>
      </Modal>,
    );
  }

  const post = await findCollectorPost(postId);

  if (!post || post.userId !== user.id) {
    return c.html(
      <Modal title="Edit post">
        <p class="text-sm text-on-surface">Post not found.</p>
      </Modal>,
    );
  }

  return c.html(
    <Modal title="Edit post" maxWidth="max-w-2xl">
      <CollectorPostForm
        postId={post.id}
        initialBody={post.body}
        initialImageUrl={post.imageUrl}
      />
    </Modal>,
  );
});

export const PATCH = createRoute(async (c) => {
  const user = await getUser(c);
  const postId = routeParam(c, "postId");

  if (!canEditPost(user) || !user?.id) {
    return showErrorAlert(c, "You can't do that.");
  }

  const post = await findCollectorPost(postId);
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
      `Post is too long (max ${POST_BODY_MAX_LENGTH} characters)`,
    );
  }

  const rawImage = body.image;
  if (Array.isArray(rawImage)) {
    return showErrorAlert(c, "Only one image is allowed per post");
  }

  let imageUrl: string | undefined = undefined;
  if (rawImage instanceof File && rawImage.size > 0) {
    if (!removeInvalidImages(rawImage)) {
      return showErrorAlert(c, "Please upload a valid image file");
    }
    try {
      const uploaded = await uploadImage(
        rawImage,
        `users/${user.id}/posts`,
        "gallery",
      );
      imageUrl = uploaded.url;
    } catch (error) {
      console.error("collector post image upload failed", error);
      return showErrorAlert(c, "Failed to upload image");
    }
  }

  const [err] = await updatePost(postId, user.id, {
    body: postBody,
    ...(imageUrl !== undefined ? { imageUrl } : {}),
  });
  if (err) return showErrorAlert(c, err.reason);

  return c.html(
    <>
      <Alert type="success" message="Post updated." />
      {dispatchEvents(["posts:updated"])}
      <div id="modal-root"></div>
    </>,
  );
});

export const DELETE = createRoute(async (c) => {
  const user = await getUser(c);
  const postId = routeParam(c, "postId");

  if (!user?.id) {
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

  return c.html(
    <>
      <Alert type="success" message="Post deleted." />
      {dispatchEvents(["posts:updated"])}
    </>,
  );
});
