import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import { slugSchema } from "../../../features/app/schema";
import { handleOutboundPurchaseRedirect } from "../../../features/purchase-clicks/redirect";
import type { BookDetailContext } from "../../../features/app/types";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: BookDetailContext) => handleOutboundPurchaseRedirect(c),
);
