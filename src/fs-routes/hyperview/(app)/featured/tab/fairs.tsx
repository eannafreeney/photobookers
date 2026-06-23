import { createRoute } from "hono-fsr";
import FairsSection from "../../../../../features/hyperview/components/FairsSection";
import { hyperview } from "../../../../../lib/hxml";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { getUser } from "../../../../../utils";
import { isFeatureEnabledForUser } from "../../../../../lib/features";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  if (!isFeatureEnabledForUser("fairs", user)) {
    return hv(<view xmlns="https://hyperview.org/hyperview" />);
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      <FairsSection baseUrl={baseUrl} />
    </view>,
  );
});
