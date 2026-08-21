import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../../utils.js";
import { showErrorAlert } from "../../../lib/alertHelpers.js";
import { removeInvalidImages, uploadImage } from "../../../services/storage.js";
import Alert from "../../../components/app/Alert.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import PageHeader from "../../../components/app/PageHeader.js";
import Banner from "../../../components/app/Banner.js";
import Link from "../../../components/app/Link.js";
import InfoPage from "../../../pages/InfoPage.js";
import MemberDashboardShell from "../../../features/dashboard/components/MemberDashboardShell.js";
import PostForm from "../../../features/collectors/components/PostForm.js";
import PostsTable from "../../../features/collectors/components/PostsTable.js";
import { createPost } from "../../../domain/posts/services.js";
import { POST_BODY_MAX_LENGTH } from "../../../domain/posts/utils.js";
import { getPendingClaim } from "../../../features/claims/services.js";
import { dispatchEvents } from "../../../lib/disatchEvents.js";
import { getIsMobile } from "../../../lib/device.js";
import { createMessageCreatedNotification } from "../../../domain/notifications/utils.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  if (!user?.id) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const claimStatus = user.creator ? (await getPendingClaim(user.id, user.creator.id))[1]?.status ?? null : null;
  const canPostToShelf = Boolean(user.shelfPublic && user.shelfSlug);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
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
              !canPostToShelf ? /* @__PURE__ */ jsx(
                Banner,
                {
                  type: "info",
                  message: "Posts are disabled while your shelf is private. Make your shelf public to share updates with people who follow you.",
                  children: /* @__PURE__ */ jsx(Link, { href: "/dashboard/shelf", className: "text-sm text-accent", children: "Manage shelf settings" })
                }
              ) : null,
              /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-8 xl:grid-cols-3 xl:items-start", children: [
                /* @__PURE__ */ jsx("div", { class: "bg-surface-alt p-4 rounded-md xl:sticky xl:top-24", children: /* @__PURE__ */ jsx(
                  PostForm,
                  {
                    disabled: !canPostToShelf,
                    placeholder: user.creator ? "Share fair dates, new work, or news with your followers\u2026" : void 0
                  }
                ) }),
                /* @__PURE__ */ jsx("div", { class: "xl:col-span-2", children: /* @__PURE__ */ jsx(PostsTable, { userId: user.id, isMobile }) })
              ] })
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
  const [err, post] = await createPost(user.id, { body: postBody, imageUrl });
  if (err || !post)
    return showErrorAlert(c, err?.reason ?? "Failed to create post");
  if (user.creator) {
    createMessageCreatedNotification(user, user.creator, post);
  }
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Post published." }),
      dispatchEvents(["posts:updated"])
    ] })
  );
});
export {
  GET,
  POST
};
