import { createRoute } from "hono-fsr";
import { formValidator, queryValidator } from "../../../../../lib/validator";
import {
  spotlightBlurbQuerySchema,
  spotlightBlurbSaveSchema,
} from "../../../../../features/dashboard/admin/planner/schema";
import SpotlightBlurbModal from "../../../../../features/dashboard/admin/planner/modals/SpotlightBlurbModal";
import {
  findSpotlightBlurbEditorItem,
  getWeekSpotlightBlurbEditorData,
} from "../../../../../features/dashboard/admin/planner/spotlightBlurb";
import { getWeekInstagramForPrepare } from "../../../../../features/dashboard/admin/planner/social-media/instagramServices";
import { parseWeekString } from "../../../../../lib/utils";
import Alert from "../../../../../components/app/Alert";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { saveWeekSpotlightBlurbs } from "../../../../../features/dashboard/admin/planner/spotlightBlurb";

export const GET = createRoute(
  queryValidator(spotlightBlurbQuerySchema),
  async (c) => {
    const { week, key } = c.req.valid("query");
    const weekStart = parseWeekString(week);
    if (Number.isNaN(weekStart.getTime())) {
      return c.html(<Alert type="danger" message="Invalid week" />);
    }

    const [loadError, weekData] = await getWeekInstagramForPrepare(weekStart);
    if (loadError) return showErrorAlert(c, loadError.reason);

    const [itemsError, items] = await getWeekSpotlightBlurbEditorData(weekData);
    if (itemsError) return showErrorAlert(c, itemsError.reason);

    const item = findSpotlightBlurbEditorItem(items, key);
    if (!item) return showErrorAlert(c, "Spotlight blurb item not found");

    return c.html(
      <SpotlightBlurbModal
        week={week}
        fieldKey={key}
        title={
          item.kind === "botd"
            ? "Edit BOTD blurb"
            : item.kind === "artist"
              ? "Edit artist blurb"
              : "Edit publisher blurb"
        }
        subtitle={item.title}
        currentBlurb={item.currentBlurb}
        sourceText={item.sourceText}
      />,
    );
  },
);

export const POST = createRoute(
  queryValidator(spotlightBlurbQuerySchema),
  formValidator(spotlightBlurbSaveSchema),
  async (c) => {
    const { week, key } = c.req.valid("query");
    const { blurb } = c.req.valid("form");
    const weekStart = parseWeekString(week);
    if (Number.isNaN(weekStart.getTime())) {
      return showErrorAlert(c, "Invalid week");
    }

    const [saveError] = await saveWeekSpotlightBlurbs(weekStart, {
      [key]: blurb,
    });
    if (saveError) return showErrorAlert(c, saveError.reason);

    return c.html(<Alert type="success" message="Spotlight blurb saved." />);
  },
);
