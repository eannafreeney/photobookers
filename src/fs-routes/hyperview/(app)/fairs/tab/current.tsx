import { createRoute } from "hono-fsr";
import { getCurrentFairs } from "../../../../../features/app/fairs/services";
import { renderFairsTab } from "../../../../../features/hyperview/lib/renderFairsTab";

export const GET = createRoute(async (c) =>
  renderFairsTab(c, getCurrentFairs, "current"),
);
