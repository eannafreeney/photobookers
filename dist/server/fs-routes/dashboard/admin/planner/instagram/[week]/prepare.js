import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { weekQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema.js";
import PrepareInstagramModal from "../../../../../../features/dashboard/admin/planner/modals/PrepareInstagramModal.js";
import {
  getWeekInstagramForPrepare,
  saveWeekInstagramPreparation
} from "../../../../../../features/dashboard/admin/planner/instagramServices.js";
import {
  extractBracketedFormFields,
  parsePrepareInstagramForm
} from "../../../../../../features/dashboard/admin/planner/instagramUtils.js";
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
  const [error, data] = await getWeekInstagramForPrepare(weekStart);
  if (error) {
    return c.html(
      /* @__PURE__ */ jsx(Alert, { type: "danger", message: "Failed to load Instagram plan for this week" })
    );
  }
  return c.html(
    /* @__PURE__ */ jsx(
      PrepareInstagramModal,
      {
        week,
        entries: data.botdEntries,
        artistOfTheWeek: data.artistOfTheWeek,
        publisherOfTheWeek: data.publisherOfTheWeek,
        artistBookCoverUrls: data.artistBookCoverUrls,
        publisherBookCoverUrls: data.publisherBookCoverUrls
      }
    )
  );
});
const POST = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime())) {
    return showErrorAlert(c, "Invalid week");
  }
  const body = await c.req.parseBody({ all: true });
  const captions = extractBracketedFormFields(body, "captions");
  const imageUrl = extractBracketedFormFields(body, "imageUrl");
  const [parseError, payload] = parsePrepareInstagramForm({
    captions,
    imageUrl
  });
  if (parseError) return showErrorAlert(c, parseError.reason);
  const [saveError, result] = await saveWeekInstagramPreparation(
    weekStart,
    payload
  );
  if (saveError) return showErrorAlert(c, saveError.reason);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: `Instagram prepared for ${result.saved} post${result.saved === 1 ? "" : "s"}.`
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
