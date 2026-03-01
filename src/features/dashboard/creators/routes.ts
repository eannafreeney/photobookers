import { Hono } from "hono";
import { getEditCreatorPage, updateCreator } from "./controllers";
import { formValidator, paramValidator } from "../../../lib/validator";
import { creatorFormSchema, creatorIdSchema } from "../../../schemas";
import { requireCreatorEditAccess } from "../../../middleware/creatorGuard";
import { methodOverride } from "hono/method-override";

export const creatorDashboardRoutes = new Hono();

creatorDashboardRoutes.use(
  "/posts",
  methodOverride({ app: creatorDashboardRoutes }),
);

creatorDashboardRoutes.get(
  "/edit/:creatorId",
  paramValidator(creatorIdSchema),
  requireCreatorEditAccess,
  getEditCreatorPage,
);

creatorDashboardRoutes.patch(
  "/edit/:creatorId",
  paramValidator(creatorIdSchema),
  formValidator(creatorFormSchema),
  requireCreatorEditAccess,
  updateCreator,
);
