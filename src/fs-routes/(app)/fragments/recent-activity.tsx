import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils";
import HomepageRecentActivity from "../../../features/app/components/HomepageRecentActivity";
import { getHomepageActivityStats } from "@/features/app/homepageActivity";
import { getRecentPublicActivityPage } from "../../../features/app/homepageRecentActivity";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const [[error, page], [statsError, stats]] = await Promise.all([
    getRecentPublicActivityPage(),
    getHomepageActivityStats(),
  ]);

  if (error || !page?.items.length) {
    return c.html(<div id="recent-activity-fragment"></div>);
  }

  return c.html(
    <div id="recent-activity-fragment">
      <HomepageRecentActivity
        items={page.items}
        currentUserId={user?.id}
        hasMore={page.hasMore}
        nextOffset={page.nextOffset}
        pageSize={page.pageSize}
        stats={statsError ? null : stats}
      />
    </div>,
  );
});
