import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils";
import HomepageRecentActivity from "../../../features/app/components/HomepageRecentActivity";
import { getRecentPublicActivityPage } from "../../../features/app/homepageRecentActivity";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const [error, page] = await getRecentPublicActivityPage();

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
      />
    </div>,
  );
});
