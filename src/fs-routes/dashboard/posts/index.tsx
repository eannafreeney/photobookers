import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils";
import { isFeatureEnabledForUser } from "../../../lib/features";
import { showErrorAlert } from "../../../lib/alertHelpers";
import { removeInvalidImages, uploadImage } from "../../../services/storage";
import Alert from "../../../components/app/Alert";
import {
  insertCollectorPost,
  listCollectorPosts,
} from "../../../db/queries";
import { CollectorPostsTableBody } from "../../../features/collectors/components/CollectorPostsTable";

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);

  if (!user?.id || !isFeatureEnabledForUser("collectors", user)) {
    return showErrorAlert(c, "You can't post right now.");
  }

  // Public opt-in: posts only make sense once the collector's shelf is public.
  if (!user.shelfPublic || !user.shelfSlug) {
    return showErrorAlert(
      c,
      "Make your shelf public before posting. Open Shelf → Share your shelf.",
    );
  }

  const body = await c.req.parseBody({ all: true });

  const postBody = String(body.body ?? "").trim();
  if (!postBody) {
    return showErrorAlert(c, "Post text is required");
  }
  if (postBody.length > 5000) {
    return showErrorAlert(c, "Post is too long (max 5000 characters)");
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

  try {
    await insertCollectorPost(user.id, { body: postBody, imageUrl });
  } catch (error) {
    console.error("Failed to create collector post", error);
    return showErrorAlert(c, "Failed to publish post");
  }

  const posts = await listCollectorPosts(user.id);

  return c.html(
    <>
      <Alert type="success" message="Post published." />
      <CollectorPostsTableBody posts={posts} />
    </>,
  );
});
