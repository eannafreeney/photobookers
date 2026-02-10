import { createMiddleware } from "hono/factory";
import { getUser } from "../utils";
import { Creator } from "../db/schema";
import { showErrorAlert } from "../lib/alertHelpers";
import { getCreatorById } from "../services/creators";
import { canEditCreator } from "../lib/permissions";

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
      return showErrorAlert(c, "Creator ID is required");
    }
    const creator = await getCreatorById(creatorId);

    if (!creator) {
      return showErrorAlert(c, "Creator not found");
    }

    if (!canEditCreator(user, creator)) {
      return showErrorAlert(c, "Unauthorized");
    }

    // Attach creator to context so route doesn't need to fetch again
    c.set("creator", creator);
    await next();
  },
);
