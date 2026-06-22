import { createRoute } from "hono-fsr";
import TrendingCreatorsSlider from "../../../../../features/hyperview/components/TrendingCreatorsSlider";
import { hyperview } from "../../../../../lib/hxml";
import { getBaseUrl } from "../../../../../lib/hyperview";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      <TrendingCreatorsSlider baseUrl={baseUrl} />
    </view>,
  );
});
