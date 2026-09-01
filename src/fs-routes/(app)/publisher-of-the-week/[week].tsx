import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import InfoPage from "../../../pages/InfoPage";
import { weekParamSchema } from "../../../features/app/schema";
import { getPublisherOfTheWeekForDateQuery } from "../../../features/app/POTWServices";
import { creatorPath } from "../../../features/app/spotlightUrls";
import { getUser } from "../../../utils";

export const GET = createRoute(paramValidator(weekParamSchema), async (c) => {
  const user = await getUser(c);
  const weekStart = c.req.valid("param").week;

  const [potwError, publisherOfTheWeek] =
    await getPublisherOfTheWeekForDateQuery(weekStart);
  if (potwError || !publisherOfTheWeek.creator?.slug) {
    return c.html(
      <InfoPage errorMessage="Publisher of the week not found" user={user} />,
      404,
    );
  }

  return c.redirect(creatorPath(publisherOfTheWeek.creator.slug), 301);
});
