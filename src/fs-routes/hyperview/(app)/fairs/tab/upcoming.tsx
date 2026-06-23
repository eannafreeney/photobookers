import { createRoute } from "hono-fsr";
import { getUpcomingFairs } from "../../../../../features/app/fairs/services";
import { renderFairsTab } from "../../../../../features/hyperview/lib/renderFairsTab";

export const GET = createRoute(async (c) =>
  renderFairsTab(c, getUpcomingFairs, "upcoming"),
);
