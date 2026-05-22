import { createRoute } from "hono-fsr";
import FeaturedScreen from "../../../features/hyperview/components/FeaturedScreen";
import { hyperview } from "../../../lib/hxml";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";

export const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);

  return hv(<FeaturedScreen baseUrl={baseUrl} user={user} />);
});
