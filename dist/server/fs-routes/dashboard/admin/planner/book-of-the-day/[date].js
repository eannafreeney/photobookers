import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { dateQuerySchema } from "../../../../../features/dashboard/admin/planner/schema.js";
import { parseDateString } from "../../../../../lib/utils.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import Alert from "../../../../../components/app/Alert.js";
import { deleteBookOfTheDayByDate } from "../../../../../features/dashboard/admin/planner/services.js";
import { dispatchEvents } from "../../../../../lib/disatchEvents.js";
const DELETE = createRoute(
  paramValidator(dateQuerySchema),
  async (c) => {
    const date = c.req.valid("param").date;
    const day = parseDateString(date);
    if (Number.isNaN(day.getTime())) return showErrorAlert(c, "Invalid date");
    const [error] = await deleteBookOfTheDayByDate(day);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Book of the Day deleted!" }),
        dispatchEvents(["planner:updated"])
      ] })
    );
  }
);
export {
  DELETE
};
