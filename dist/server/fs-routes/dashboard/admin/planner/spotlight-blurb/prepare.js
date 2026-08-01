import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, queryValidator } from "../../../../../lib/validator.js";
import {
  spotlightBlurbQuerySchema,
  spotlightBlurbSaveSchema
} from "../../../../../features/dashboard/admin/planner/schema.js";
import SpotlightBlurbModal from "../../../../../features/dashboard/admin/planner/modals/SpotlightBlurbModal.js";
import {
  findSpotlightBlurbEditorItem,
  getWeekSpotlightBlurbEditorData
} from "../../../../../features/dashboard/admin/planner/spotlightBlurb.js";
import { getWeekInstagramForPrepare } from "../../../../../features/dashboard/admin/planner/social-media/instagramServices.js";
import { parseWeekString } from "../../../../../lib/utils.js";
import Alert from "../../../../../components/app/Alert.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { saveWeekSpotlightBlurbs } from "../../../../../features/dashboard/admin/planner/spotlightBlurb.js";
const GET = createRoute(
  queryValidator(spotlightBlurbQuerySchema),
  async (c) => {
    const { week, key } = c.req.valid("query");
    const weekStart = parseWeekString(week);
    if (Number.isNaN(weekStart.getTime())) {
      return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: "Invalid week" }));
    }
    const [loadError, weekData] = await getWeekInstagramForPrepare(weekStart);
    if (loadError) return showErrorAlert(c, loadError.reason);
    const [itemsError, items] = await getWeekSpotlightBlurbEditorData(weekData);
    if (itemsError) return showErrorAlert(c, itemsError.reason);
    const item = findSpotlightBlurbEditorItem(items, key);
    if (!item) return showErrorAlert(c, "Spotlight blurb item not found");
    return c.html(
      /* @__PURE__ */ jsx(
        SpotlightBlurbModal,
        {
          week,
          fieldKey: key,
          title: item.kind === "botd" ? "Edit BOTD blurb" : item.kind === "artist" ? "Edit artist blurb" : "Edit publisher blurb",
          subtitle: item.title,
          currentBlurb: item.currentBlurb,
          sourceText: item.sourceText
        }
      )
    );
  }
);
const POST = createRoute(
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
      [key]: blurb
    });
    if (saveError) return showErrorAlert(c, saveError.reason);
    return c.html(/* @__PURE__ */ jsx(Alert, { type: "success", message: "Spotlight blurb saved." }));
  }
);
export {
  GET,
  POST
};
