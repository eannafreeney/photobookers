import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { weekQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema.js";
import SpotlightCopyModal from "../../../../../../features/dashboard/admin/planner/modals/SpotlightCopyModal.js";
import {
  getWeekSpotlightBlurbEditorData,
  saveWeekSpotlightBlurbs
} from "../../../../../../features/dashboard/admin/planner/spotlightBlurb.js";
import { getWeekInstagramForPrepare } from "../../../../../../features/dashboard/admin/planner/social-media/instagramServices.js";
import { extractBracketedFormFields } from "../../../../../../features/dashboard/admin/planner/social-media/instagramUtils.js";
import { parseWeekString } from "../../../../../../lib/utils.js";
import { showErrorAlert } from "../../../../../../lib/alertHelpers.js";
import Alert from "../../../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../../../lib/disatchEvents.js";
const GET = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime())) {
    return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: "Invalid week" }));
  }
  const [loadError, weekData] = await getWeekInstagramForPrepare(weekStart);
  if (loadError) {
    return c.html(
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "danger",
          message: "Failed to load spotlight copy for this week"
        }
      )
    );
  }
  const [editorError, items] = await getWeekSpotlightBlurbEditorData(weekData);
  if (editorError) {
    return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: editorError.reason }));
  }
  return c.html(/* @__PURE__ */ jsx(SpotlightCopyModal, { week, items }));
});
const POST = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime())) {
    return showErrorAlert(c, "Invalid week");
  }
  const body = await c.req.parseBody({ all: true });
  const blurbs = extractBracketedFormFields(body, "blurbs");
  if (Object.keys(blurbs).length === 0) {
    return showErrorAlert(c, "No spotlight copy to save");
  }
  const [saveError, result] = await saveWeekSpotlightBlurbs(weekStart, blurbs);
  if (saveError) return showErrorAlert(c, saveError.reason);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: `Spotlight copy saved for ${result.saved} item${result.saved === 1 ? "" : "s"}.`
        }
      ),
      dispatchEvents(["planner:updated"])
    ] })
  );
});
export {
  GET,
  POST
};
