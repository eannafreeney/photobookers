import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { weekQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema";
import PrepareInstagramModal from "../../../../../../features/dashboard/admin/planner/modals/PrepareInstagramModal";
import {
  getWeekInstagramForPrepare,
  saveWeekInstagramPreparation,
} from "../../../../../../features/dashboard/admin/planner/instagramServices";
import {
  extractBracketedFormFields,
  parsePrepareInstagramForm,
} from "../../../../../../features/dashboard/admin/planner/instagramUtils";
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
      <Alert type="danger" message="Failed to load Instagram plan for this week" />,
    );
  }

  return c.html(
    <PrepareInstagramModal
      week={week}
      entries={data.botdEntries}
      artistOfTheWeek={data.artistOfTheWeek}
      publisherOfTheWeek={data.publisherOfTheWeek}
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
  const captions = extractBracketedFormFields(body, "captions");
  const imageUrl = extractBracketedFormFields(body, "imageUrl");

  const [parseError, payload] = parsePrepareInstagramForm({
    captions,
    imageUrl,
  });
  if (parseError) return showErrorAlert(c, parseError.reason);

  const [saveError, result] = await saveWeekInstagramPreparation(
    weekStart,
    payload,
  );
  if (saveError) return showErrorAlert(c, saveError.reason);

  return c.html(
    <>
      <Alert
        type="success"
        message={`Instagram prepared for ${result.saved} post${result.saved === 1 ? "" : "s"}.`}
      />
      {dispatchEvents(["planner:updated"])}
    </>,
  );
});
