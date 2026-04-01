import { createMiddleware } from "hono/factory";
import { getUser } from "../utils";
import { Creator } from "../db/schema";
import { showErrorAlert } from "../lib/alertHelpers";
import { canEditCreator } from "../lib/permissions";
import { getCreatorById } from "../features/dashboard/creators/services";
import InfoPage from "../pages/InfoPage";

type CreatorEnv = {
  Variables: {
    creator: Creator;
  };
};

export const requireCreatorEditAccess = createMiddleware<CreatorEnv>(
  async (c, next) => {
    const user = await getUser(c);
    const creatorId = c.req.param("creatorId");

    if (!creatorId) {
      return c.html(
        <InfoPage errorMessage="Creator ID is required" user={user} />,
        400,
      );
    }

    const [error, creator] = await getCreatorById(creatorId);
    if (error || !creator) {
      return c.html(
        <InfoPage errorMessage="Creator not found" user={user} />,
        404,
      );
    }

    if (!creator) {
      return c.html(
        <InfoPage errorMessage="Creator not found" user={user} />,
        404,
      );
    }

    if (!canEditCreator(user, creator)) {
      if (user?.creator?.status !== "verified") {
        const notYetVerifiedErrorMessage =
          "Your creator profile is pending verification. You can upload and edit books, but profile editing is only available after your profile is approved.";
        return c.html(
          <InfoPage errorMessage={notYetVerifiedErrorMessage} user={user} />,
          403,
        );
      }
      return c.html(<InfoPage errorMessage="Unauthorized" user={user} />, 403);
    }

    // Attach creator to context so route doesn't need to fetch again
    c.set("creator", creator);
    await next();
  },
);
