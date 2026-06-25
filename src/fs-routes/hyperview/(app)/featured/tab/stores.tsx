import { createRoute } from "hono-fsr";
import StoresSection from "../../../../../features/hyperview/components/StoresSection";
import { hyperview } from "../../../../../lib/hxml";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { isFeatureEnabled } from "../../../../../lib/features";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);

  if (!isFeatureEnabled("stores")) {
    return hv(<view xmlns="https://hyperview.org/hyperview" />);
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      <StoresSection baseUrl={baseUrl} />
    </view>,
  );
});
