import { createMiddleware } from "hono/factory";
import { getUser } from "../utils";
import { showErrorAlert } from "../lib/alertHelpers";
import { User } from "../db/schema";

type ImageEnv = {
  Variables: {
    user: User;
  };
};

export const requireImageEditAccess = createMiddleware<ImageEnv>(
  async (c, next) => {
    const user = await getUser(c);
    if (!user) {
      return showErrorAlert(c, "User not found");
    }
    await next();
  },
);

export const requireImageDeleteAccess = createMiddleware<ImageEnv>(
  async (c, next) => {
    const user = await getUser(c);
    if (!user) {
      return showErrorAlert(c, "User not found");
    }
    await next();
  },
);
