import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { weekQuerySchema } from "../../../../../features/dashboard/admin/planner/schema.js";
import { parseWeekString } from "../../../../../lib/utils.js";
import { deleteArtistOfTheWeekByWeekStart } from "../../../../../features/dashboard/admin/planner/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import Alert from "../../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../../lib/disatchEvents.js";
const DELETE = createRoute(
  paramValidator(weekQuerySchema),
  async (c) => {
    const week = c.req.valid("param").week;
    const weekStart = parseWeekString(week);
    if (Number.isNaN(weekStart.getTime()))
      return showErrorAlert(c, "Invalid week");
    const [error] = await deleteArtistOfTheWeekByWeekStart(weekStart);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Artist of the Week removed." }),
        dispatchEvents(["planner:updated"])
      ] })
    );
  }
);
export {
  DELETE
};
