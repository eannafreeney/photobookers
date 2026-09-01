import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import InfoPage from "../../../pages/InfoPage";
import { weekParamSchema } from "../../../features/app/schema";
import { getArtistOfTheWeekForDateQuery } from "../../../features/app/AOTWServices";
import { creatorPath } from "../../../features/app/spotlightUrls";
import { getUser } from "../../../utils";

export const GET = createRoute(paramValidator(weekParamSchema), async (c) => {
  const user = await getUser(c);
  const weekStart = c.req.valid("param").week;

  const [aotwError, artistOfTheWeek] =
    await getArtistOfTheWeekForDateQuery(weekStart);
  if (aotwError || !artistOfTheWeek.creator?.slug) {
    return c.html(
      <InfoPage errorMessage="Artist of the week not found" user={user} />,
      404,
    );
  }

  return c.redirect(creatorPath(artistOfTheWeek.creator.slug), 301);
});
