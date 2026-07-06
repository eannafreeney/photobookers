import { createRoute } from "hono-fsr";
import { getPastFairs } from "../../../../../features/app/fairs/services.js";
import { renderFairsTab } from "../../../../../features/hyperview/lib/renderFairsTab.js";
const GET = createRoute(
  async (c) => renderFairsTab(c, getPastFairs, "past")
);
export {
  GET
};
