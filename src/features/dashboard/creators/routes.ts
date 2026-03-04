import { Hono } from "hono";
import { getEditCreatorPage, updateCreator } from "./controllers";
import { formValidator, paramValidator } from "../../../lib/validator";
import { creatorIdSchema } from "../../../schemas";
import { creatorFormSchema } from "./schema";
import { requireCreatorEditAccess } from "../../../middleware/creatorGuard";

export const creatorDashboardRoutes = new Hono();

creatorDashboardRoutes.get(
  "/:creatorId/update",
  paramValidator(creatorIdSchema),
  requireCreatorEditAccess,
  getEditCreatorPage,
);
creatorDashboardRoutes.post(
  "/:creatorId/update",
  paramValidator(creatorIdSchema),
  formValidator(creatorFormSchema),
  requireCreatorEditAccess,
  updateCreator,
);
