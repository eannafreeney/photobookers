import { createRoute } from "hono-fsr";
import { getUpcomingFairs } from "../../../../../features/app/fairs/services.js";
import { renderFairsTab } from "../../../../../features/hyperview/lib/renderFairsTab.js";
const GET = createRoute(
  async (c) => renderFairsTab(c, getUpcomingFairs, "upcoming")
);
export {
  GET
};
