import { getMessagesListPage, postCreateMessage } from "./controllers";
import { formValidator, paramValidator } from "../../../lib/validator";
import { createMessageFormSchema } from "./schema";
import { creatorIdSchema } from "../../../schemas";
import { requireCreatorEditAccess } from "../../../middleware/creatorGuard";
import { Hono } from "hono";

export const messagesDashboardRoutes = new Hono();

messagesDashboardRoutes.get(
  "/:creatorId",
  paramValidator(creatorIdSchema),
  requireCreatorEditAccess,
  getMessagesListPage,
);
messagesDashboardRoutes.post(
  "/:creatorId/create",
  paramValidator(creatorIdSchema),
  formValidator(createMessageFormSchema),
  requireCreatorEditAccess,
  postCreateMessage,
);
