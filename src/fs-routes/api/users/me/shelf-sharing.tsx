import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../../../utils";
import { isFeatureEnabledForUser } from "../../../../lib/features";
import InfoPage from "../../../../pages/InfoPage";
import ShelfSharingPanel from "../../../../features/app/components/ShelfSharingPanel";
import {
  suggestShelfSlug,
  updateShelfSharing,
} from "../../../../domain/shelf/services";
import Alert from "../../../../components/app/Alert";

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);
  if (!user) {
    return c.html(<Alert type="danger" message="Sign in to update your shelf." />, 401);
  }

  if (!isFeatureEnabledForUser("collectors", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const body = await c.req.parseBody();
  const shelfPublic = body.shelfPublic === "true";
  const shelfSlug =
    typeof body.shelfSlug === "string" ? body.shelfSlug : undefined;

  const [error, updated] = await updateShelfSharing(user.id, {
    shelfPublic,
    shelfSlug,
  });

  if (error || !updated) {
    const suggestedSlug = await suggestShelfSlug(user.id);
    return c.html(
      <ShelfSharingPanel
        user={{
          ...user,
          shelfSlug: user.shelfSlug,
          shelfPublic: user.shelfPublic,
        }}
        suggestedSlug={suggestedSlug}
        message={error?.reason ?? "Failed to update shelf sharing"}
      />,
      400,
    );
  }

  const suggestedSlug = await suggestShelfSlug(user.id);
  const message = updated.shelfPublic
    ? "Your shelf is now public."
    : "Your shelf is now private.";

  return c.html(
    <ShelfSharingPanel
      user={{
        ...user,
        shelfSlug: updated.shelfSlug,
        shelfPublic: updated.shelfPublic,
      }}
      suggestedSlug={suggestedSlug}
      message={message}
    />,
  );
});
