import { Hono } from "hono";
import { getClaimModal, processClaim, verifyClaimPage } from "./controllers";
import { creatorIdSchema, currentPathSchema } from "../../schemas";
import { formValidator, paramValidator } from "../../lib/validator";
import { claimFormSchema, tokenSchema } from "./schema";

export const claimRoutes = new Hono();

claimRoutes.get(
  "/:creatorId",
  paramValidator(creatorIdSchema),
  formValidator(currentPathSchema),
  getClaimModal,
);
claimRoutes.post(
  "/:creatorId",
  paramValidator(creatorIdSchema),
  formValidator(claimFormSchema),
  processClaim,
);
claimRoutes.get("/verify/:token", paramValidator(tokenSchema), verifyClaimPage);
