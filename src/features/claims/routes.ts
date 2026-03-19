import { Hono } from "hono";
import {
  getClaimComplete,
  getClaimModal,
  processClaim,
  processRegisterAndClaim,
} from "./controllers";
import { currentPathSchema, creatorIdSchema } from "../../schemas";
import {
  formValidator,
  paramValidator,
  queryValidator,
} from "../../lib/validator";
import {
  claimCompleteQuerySchema,
  claimFormSchema,
  registerAndClaimFormSchema,
} from "./schema";

export const claimRoutes = new Hono();

claimRoutes.get(
  "/complete",
  queryValidator(claimCompleteQuerySchema),
  getClaimComplete,
);
claimRoutes.get(
  "/:creatorId",
  paramValidator(creatorIdSchema),
  queryValidator(currentPathSchema),
  getClaimModal,
);
claimRoutes.post(
  "/:creatorId/register-and-claim",
  paramValidator(creatorIdSchema),
  formValidator(registerAndClaimFormSchema),
  processRegisterAndClaim,
);
claimRoutes.post(
  "/:creatorId",
  paramValidator(creatorIdSchema),
  formValidator(claimFormSchema),
  processClaim,
);
