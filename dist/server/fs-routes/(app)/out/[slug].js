import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator.js";
import { slugSchema } from "../../../features/app/schema.js";
import { handleOutboundPurchaseRedirect } from "../../../features/purchase-clicks/redirect.js";
const GET = createRoute(
  paramValidator(slugSchema),
  async (c) => handleOutboundPurchaseRedirect(c)
);
export {
  GET
};
