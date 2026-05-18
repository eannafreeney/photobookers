import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../lib/hxml";
import FeaturedHomeBody from "../../../../../features/hyperview/components/FeaturedHomeBody";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { getUser } from "../../../../../utils";

export const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      <FeaturedHomeBody baseUrl={baseUrl} user={user} />
    </view>,
  );
});
