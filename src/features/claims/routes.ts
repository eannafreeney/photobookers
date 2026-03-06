import { Hono } from "hono";
import { getClaimModal, processClaim } from "./controllers";
import { currentPathSchema, creatorIdSchema } from "../../schemas";
import {
  formValidator,
  paramValidator,
  queryValidator,
} from "../../lib/validator";
import { claimFormSchema } from "./schema";

export const claimRoutes = new Hono();

claimRoutes.get(
  "/:creatorId",
  paramValidator(creatorIdSchema),
  queryValidator(currentPathSchema),
  getClaimModal,
);
claimRoutes.post(
  "/:creatorId",
  paramValidator(creatorIdSchema),
  formValidator(claimFormSchema),
  processClaim,
);
