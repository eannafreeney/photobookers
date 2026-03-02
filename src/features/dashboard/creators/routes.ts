import { Hono } from "hono";
import { getEditCreatorPage, updateCreator } from "./controllers";
import { formValidator, paramValidator } from "../../../lib/validator";
import { creatorIdSchema } from "../../../schemas";
import { creatorFormSchema } from "./schema";
import { requireCreatorEditAccess } from "../../../middleware/creatorGuard";
import { methodOverride } from "hono/method-override";

export const creatorDashboardRoutes = new Hono();

creatorDashboardRoutes.use(
  "/posts",
  methodOverride({ app: creatorDashboardRoutes }),
);

creatorDashboardRoutes.get(
  "/:creatorId",
  paramValidator(creatorIdSchema),
  requireCreatorEditAccess,
  getEditCreatorPage,
);
creatorDashboardRoutes.patch(
  "/:creatorId",
  paramValidator(creatorIdSchema),
  formValidator(creatorFormSchema),
  requireCreatorEditAccess,
  updateCreator,
);
