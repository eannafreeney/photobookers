import { createRoute } from "hono-fsr";
import { getPastFairs } from "../../../../../features/app/fairs/services";
import { renderFairsTab } from "../../../../../features/hyperview/lib/renderFairsTab";

export const GET = createRoute(async (c) =>
  renderFairsTab(c, getPastFairs, "past"),
);
