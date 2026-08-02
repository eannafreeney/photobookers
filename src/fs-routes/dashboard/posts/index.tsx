import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../../utils";
import { isFeatureEnabledForUser } from "../../../lib/features";
import { showErrorAlert } from "../../../lib/alertHelpers";
import { removeInvalidImages, uploadImage } from "../../../services/storage";
import Alert from "../../../components/app/Alert";
import AppLayout from "../../../components/layouts/AppLayout";
import PageHeader from "@/components/app/PageHeader";
import InfoPage from "../../../pages/InfoPage";
import MemberDashboardShell from "../../../features/dashboard/components/MemberDashboardShell";
import CollectorPostForm from "../../../features/collectors/components/CollectorPostForm";
import CollectorPostsTable, {
  CollectorPostsTableBody,
} from "../../../features/collectors/components/CollectorPostsTable";
import MessageForm from "../../../features/dashboard/messages/forms/MessageForm";
import MessagesTable from "../../../features/dashboard/messages/components/MessagesTable";
import { createPost } from "../../../domain/posts/services";
import { getPendingClaim } from "../../../features/claims/services";
import { listCollectorPosts } from "../../../db/queries";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;

  if (!user?.id) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  if (!user.creator && !isFeatureEnabledForUser("collectors", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const claimStatus = user.creator
    ? (await getPendingClaim(user.id, user.creator.id))[1]?.status ?? null
    : null;

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
        <div class="grid grid-cols-1 gap-8 xl:grid-cols-3">
          {user.creator ? (
            <>
              <MessageForm creatorId={user.creator.id} />
              <div class="xl:col-span-2">
                <MessagesTable creatorId={user.creator.id} />
              </div>
            </>
          ) : (
            <>
              <CollectorPostForm />
              <div class="xl:col-span-2">
                <CollectorPostsTable userId={user.id} />
              </div>
            </>
          )}
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

  if (user.creator) {
    return showErrorAlert(c, "Use the creator post form.");
  }

  if (!isFeatureEnabledForUser("collectors", user)) {
    return showErrorAlert(c, "You can't post right now.");
  }

  if (!user.shelfPublic || !user.shelfSlug) {
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

  const [err] = await createPost(user.id, { body: postBody, imageUrl });
  if (err) return showErrorAlert(c, err.reason);

  const posts = await listCollectorPosts(user.id);

  return c.html(
    <>
      <Alert type="success" message="Post published." />
      <CollectorPostsTableBody posts={posts} />
    </>,
  );
});
