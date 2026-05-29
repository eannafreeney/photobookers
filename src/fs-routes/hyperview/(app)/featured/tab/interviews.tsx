import { createRoute } from "hono-fsr";
import Interviews from "../../../../../features/hyperview/components/Interviews";
import { hyperview } from "../../../../../lib/hxml";
import { getBaseUrl } from "../../../../../lib/hyperview";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      <Interviews baseUrl={baseUrl} />
    </view>,
  );
});
