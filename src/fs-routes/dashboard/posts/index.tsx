import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../../utils";
import { showErrorAlert } from "../../../lib/alertHelpers";
import { removeInvalidImages, uploadImage } from "../../../services/storage";
import Alert from "../../../components/app/Alert";
import AppLayout from "../../../components/layouts/AppLayout";
import PageHeader from "@/components/app/PageHeader";
import Banner from "../../../components/app/Banner";
import Link from "../../../components/app/Link";
import InfoPage from "../../../pages/InfoPage";
import MemberDashboardShell from "../../../features/dashboard/components/MemberDashboardShell";
import CollectorPostForm from "../../../features/collectors/components/CollectorPostForm";
import CollectorPostsTable from "../../../features/collectors/components/CollectorPostsTable";
import { createPost } from "../../../domain/posts/services";
import { POST_BODY_MAX_LENGTH } from "../../../domain/posts/utils";
import { getPendingClaim } from "../../../features/claims/services";
import { dispatchEvents } from "../../../lib/disatchEvents";
import { getIsMobile } from "../../../lib/device";
import { createMessageCreatedNotification } from "../../../domain/notifications/utils";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;

  if (!user?.id) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const claimStatus = user.creator
    ? ((await getPendingClaim(user.id, user.creator.id))[1]?.status ?? null)
    : null;

  const canPostToShelf = Boolean(user.shelfPublic && user.shelfSlug);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

  return c.html(
    <AppLayout
      title="Posts"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <MemberDashboardShell
        user={user}
        currentPath={currentPath}
        claimStatus={claimStatus}
      >
        <PageHeader
          title="Posts"
          intro={
            user.creator
              ? "Share what's new with people who follow you."
              : "Share what's new with people who follow your shelf."
          }
        />
        {!user.creator && !canPostToShelf ? (
          <Banner
            type="info"
            message="Posts are disabled while your shelf is private. Make your shelf public to share updates with people who follow you."
          >
            <Link href="/dashboard/shelf" className="text-sm text-accent">
              Manage shelf settings
            </Link>
          </Banner>
        ) : null}
        <div class="grid grid-cols-1 gap-8 xl:grid-cols-3 xl:items-start">
          <div class="bg-surface-alt p-4 rounded-md xl:sticky xl:top-24">
            <CollectorPostForm
              disabled={!user.creator && !canPostToShelf}
              placeholder={
                user.creator
                  ? "Share fair dates, new work, or news with your followers…"
                  : undefined
              }
            />
          </div>
          <div class="xl:col-span-2">
            <CollectorPostsTable userId={user.id} isMobile={isMobile} />
          </div>
        </div>
      </MemberDashboardShell>
    </AppLayout>,
  );
});

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);

  if (!user?.id) {
    return showErrorAlert(c, "You can't post right now.");
  }

  if (!user.creator && (!user.shelfPublic || !user.shelfSlug)) {
    return showErrorAlert(
      c,
      "Make your shelf public before posting. Open Dashboard → Shelf.",
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

  const [err, post] = await createPost(user.id, { body: postBody, imageUrl });
  if (err || !post)
    return showErrorAlert(c, err?.reason ?? "Failed to create post");

  if (user.creator) {
    createMessageCreatedNotification(user, user.creator, post);
  }

  return c.html(
    <>
      <Alert type="success" message="Post published." />
      {dispatchEvents(["posts:updated"])}
    </>,
  );
});
