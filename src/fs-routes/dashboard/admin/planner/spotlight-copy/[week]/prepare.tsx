import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { weekQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema";
import SpotlightCopyModal from "../../../../../../features/dashboard/admin/planner/modals/SpotlightCopyModal";
import {
  getWeekSpotlightBlurbEditorData,
  saveWeekSpotlightBlurbs,
} from "../../../../../../features/dashboard/admin/planner/spotlightBlurb";
import { getWeekInstagramForPrepare } from "../../../../../../features/dashboard/admin/planner/instagramServices";
import { extractBracketedFormFields } from "../../../../../../features/dashboard/admin/planner/instagramUtils";
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

  const [loadError, weekData] = await getWeekInstagramForPrepare(weekStart);
  if (loadError) {
    return c.html(
      <Alert type="danger" message="Failed to load spotlight copy for this week" />,
    );
  }

  const [editorError, items] = await getWeekSpotlightBlurbEditorData(weekData);
  if (editorError) {
    return c.html(<Alert type="danger" message={editorError.reason} />);
  }

  return c.html(<SpotlightCopyModal week={week} items={items} />);
});

export const POST = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime())) {
    return showErrorAlert(c, "Invalid week");
  }

  const body = (await c.req.parseBody({ all: true })) as Record<string, unknown>;
  const blurbs = extractBracketedFormFields(body, "blurbs");
  if (Object.keys(blurbs).length === 0) {
    return showErrorAlert(c, "No spotlight copy to save");
  }

  const [saveError, result] = await saveWeekSpotlightBlurbs(weekStart, blurbs);
  if (saveError) return showErrorAlert(c, saveError.reason);

  return c.html(
    <>
      <Alert
        type="success"
        message={`Spotlight copy saved for ${result.saved} item${result.saved === 1 ? "" : "s"}.`}
      />
      {dispatchEvents(["planner:updated"])}
    </>,
  );
});
