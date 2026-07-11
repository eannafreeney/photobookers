import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { weekQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema";
import FeaturedHeroImagesModal from "../../../../../../features/dashboard/admin/planner/modals/FeaturedHeroImagesModal";
import {
  getWeekInstagramForPrepare,
  saveWeekFeaturedHeroImages,
} from "../../../../../../features/dashboard/admin/planner/social-media/instagramServices";
import {
  extractBracketedFormFields,
  parseFeaturedHeroImagesForm,
} from "../../../../../../features/dashboard/admin/planner/social-media/instagramUtils";
import { parseWeekString } from "../../../../../../lib/utils";
import { showErrorAlert } from "../../../../../../lib/alertHelpers";
import Alert from "../../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../../lib/disatchEvents";

export const GET = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime())) {
    return c.html(<Alert type="danger" message="Invalid week" />);
  }

  const [error, data] = await getWeekInstagramForPrepare(weekStart);
  if (error) {
    return c.html(
      <Alert
        type="danger"
        message="Failed to load featured hero images for this week"
      />,
    );
  }

  return c.html(
    <FeaturedHeroImagesModal
      week={week}
      entries={data.botdEntries}
      artistOfTheWeek={data.artistOfTheWeek}
      publisherOfTheWeek={data.publisherOfTheWeek}
      artistBookCoverUrls={data.artistBookCoverUrls}
      publisherBookCoverUrls={data.publisherBookCoverUrls}
    />,
  );
});

export const POST = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime())) {
    return showErrorAlert(c, "Invalid week");
  }

  const body = (await c.req.parseBody({ all: true })) as Record<
    string,
    unknown
  >;
  const imageUrl = extractBracketedFormFields(body, "imageUrl");

  const [parseError, payload] = parseFeaturedHeroImagesForm({ imageUrl });
  if (parseError) return showErrorAlert(c, parseError.reason);

  const [saveError, result] = await saveWeekFeaturedHeroImages(
    weekStart,
    payload,
  );
  if (saveError) return showErrorAlert(c, saveError.reason);

  return c.html(
    <>
      <Alert
        type="success"
        message={`Featured hero image${result.saved === 1 ? "" : "s"} saved.`}
      />
      {dispatchEvents(["planner:updated"])}
    </>,
  );
});
