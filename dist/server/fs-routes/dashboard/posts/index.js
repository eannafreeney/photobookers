import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils.js";
import { isFeatureEnabledForUser } from "../../../lib/features.js";
import { showErrorAlert } from "../../../lib/alertHelpers.js";
import { removeInvalidImages, uploadImage } from "../../../services/storage.js";
import Alert from "../../../components/app/Alert.js";
import {
  insertCollectorPost,
  listCollectorPosts
} from "../../../db/queries.js";
import { CollectorPostsTableBody } from "../../../features/collectors/components/CollectorPostsTable.js";
const POST = createRoute(async (c) => {
  const user = await getUser(c);
  if (!user?.id || !isFeatureEnabledForUser("collectors", user)) {
    return showErrorAlert(c, "You can't post right now.");
  }
  if (!user.shelfPublic || !user.shelfSlug) {
    return showErrorAlert(
      c,
      "Make your shelf public before posting. Open Shelf \u2192 Share your shelf."
    );
  }
  const body = await c.req.parseBody({ all: true });
  const postBody = String(body.body ?? "").trim();
  if (!postBody) {
    return showErrorAlert(c, "Post text is required");
  }
  if (postBody.length > 5e3) {
    return showErrorAlert(c, "Post is too long (max 5000 characters)");
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
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Post published." }),
      /* @__PURE__ */ jsx(CollectorPostsTableBody, { posts })
    ] })
  );
});
export {
  POST
};
