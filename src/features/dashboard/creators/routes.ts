import { Hono } from "hono";
import { getEditCreatorPage, updateCreator } from "./controllers";
import { formValidator, paramValidator } from "../../../lib/validator";
import { creatorFormSchema, creatorIdSchema } from "../../../schemas";
import { requireCreatorEditAccess } from "../../../middleware/creatorGuard";

export const creatorDashboardRoutes = new Hono();

creatorDashboardRoutes.get(
  "/edit/:creatorId",
  paramValidator(creatorIdSchema),
  requireCreatorEditAccess,
  getEditCreatorPage,
);

creatorDashboardRoutes.post(
  "/edit/:creatorId",
  paramValidator(creatorIdSchema),
  formValidator(creatorFormSchema),
  requireCreatorEditAccess,
  updateCreator,
);
