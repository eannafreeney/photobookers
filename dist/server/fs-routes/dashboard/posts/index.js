import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../../utils.js";
import { isFeatureEnabledForUser } from "../../../lib/features.js";
import { showErrorAlert } from "../../../lib/alertHelpers.js";
import { removeInvalidImages, uploadImage } from "../../../services/storage.js";
import Alert from "../../../components/app/Alert.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import PageHeader from "../../../components/app/PageHeader.js";
import InfoPage from "../../../pages/InfoPage.js";
import MemberDashboardShell from "../../../features/dashboard/components/MemberDashboardShell.js";
import CollectorPostForm from "../../../features/collectors/components/CollectorPostForm.js";
import CollectorPostsTable, {
  CollectorPostsTableBody
} from "../../../features/collectors/components/CollectorPostsTable.js";
import MessageForm from "../../../features/dashboard/messages/forms/MessageForm.js";
import MessagesTable from "../../../features/dashboard/messages/components/MessagesTable.js";
import { createPost } from "../../../domain/posts/services.js";
import { getPendingClaim } from "../../../features/claims/services.js";
import { listCollectorPosts } from "../../../db/queries.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  if (!user?.id) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  if (!user.creator && !isFeatureEnabledForUser("collectors", user)) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const claimStatus = user.creator ? (await getPendingClaim(user.id, user.creator.id))[1]?.status ?? null : null;
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Posts",
        user,
        flash,
        currentPath,
        children: /* @__PURE__ */ jsxs(
          MemberDashboardShell,
          {
            user,
            currentPath,
            claimStatus,
            children: [
              /* @__PURE__ */ jsx(
                PageHeader,
                {
                  title: "Posts",
                  intro: user.creator ? "Share what's new with people who follow you." : "Share what's new with people who follow your shelf."
                }
              ),
              /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 gap-8 xl:grid-cols-3", children: user.creator ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(MessageForm, { creatorId: user.creator.id }),
                /* @__PURE__ */ jsx("div", { class: "xl:col-span-2", children: /* @__PURE__ */ jsx(MessagesTable, { creatorId: user.creator.id }) })
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(CollectorPostForm, {}),
                /* @__PURE__ */ jsx("div", { class: "xl:col-span-2", children: /* @__PURE__ */ jsx(CollectorPostsTable, { userId: user.id }) })
              ] }) })
            ]
          }
        )
      }
    )
  );
});
const POST = createRoute(async (c) => {
  const user = await getUser(c);
  if (!user?.id) {
    return showErrorAlert(c, "You can't post right now.");
  }
  if (user.creator) {
    return showErrorAlert(c, "Use the creator post form.");
  }
  if (!isFeatureEnabledForUser("collectors", user)) {
    return showErrorAlert(c, "You can't post right now.");
  }
  if (!user.shelfPublic || !user.shelfSlug) {
    return showErrorAlert(
      c,
      "Make your shelf public before posting. Open Dashboard \u2192 Shelf."
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
  const [err] = await createPost(user.id, { body: postBody, imageUrl });
  if (err) return showErrorAlert(c, err.reason);
  const posts = await listCollectorPosts(user.id);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Post published." }),
      /* @__PURE__ */ jsx(CollectorPostsTableBody, { posts })
    ] })
  );
});
export {
  GET,
  POST
};
