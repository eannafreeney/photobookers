import { createRoute } from "hono-fsr";
import { getCurrentFairs } from "../../../../../features/app/fairs/services.js";
import { renderFairsTab } from "../../../../../features/hyperview/lib/renderFairsTab.js";
const GET = createRoute(
  async (c) => renderFairsTab(c, getCurrentFairs, "current")
);
export {
  GET
};
