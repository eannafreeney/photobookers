import { createRoute } from "hono-fsr";
import {
  getRecentPublicActivityPage,
  RECENT_ACTIVITY_PAGE_SIZE
} from "../../../features/app/homepageRecentActivity.js";
import { serializeRecentActivityItems } from "../../../features/app/homepageRecentActivityUtils.js";
const GET = createRoute(async (c) => {
  const offset = Math.max(0, Number(c.req.query("offset") ?? 0));
  const limit = Math.min(
    20,
    Math.max(1, Number(c.req.query("limit") ?? RECENT_ACTIVITY_PAGE_SIZE))
  );
  const [error, page] = await getRecentPublicActivityPage(offset, limit);
  if (error || !page) {
    return c.json({ error: error?.reason ?? "Failed to load activity" }, 500);
  }
  return c.json({
    items: serializeRecentActivityItems(page.items),
    hasMore: page.hasMore,
    nextOffset: page.nextOffset,
    pageSize: page.pageSize
  });
});
export {
  GET
};
