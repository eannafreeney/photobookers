import { createRoute } from "hono-fsr";
import { getLatestBooks } from "../../../../../features/app/services";
import { hyperview } from "../../../../../lib/hxml";
import FeaturedHomeBody from "../../../../../features/hyperview/components/FeaturedHomeBody";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { getUser } from "../../../../../utils";
import { likeFlagsForBooks } from "../../../../../features/hyperview/likeFlags";

export const GET = createRoute(async (c) => {
  const [, result] = await getLatestBooks(1, 30);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const books = result?.books ?? [];
  const likesByBookId = await likeFlagsForBooks(user, books);
  const hv = hyperview(c);

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      <FeaturedHomeBody
        baseUrl={baseUrl}
        books={books}
        user={user}
        likesByBookId={likesByBookId}
      />
    </view>,
  );
});
