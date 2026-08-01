import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { dateQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema.js";
import { setRandomBookOfTheDay } from "../../../../../../features/dashboard/admin/planner/services.js";
import { parseDateString } from "../../../../../../lib/utils.js";
import { showErrorAlert } from "../../../../../../lib/alertHelpers.js";
import Alert from "../../../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../../../lib/disatchEvents.js";
const POST = createRoute(paramValidator(dateQuerySchema), async (c) => {
  const date = parseDateString(c.req.valid("param").date);
  if (Number.isNaN(date.getTime())) {
    return showErrorAlert(c, "Invalid date");
  }
  const [error] = await setRandomBookOfTheDay(date);
  if (error) return showErrorAlert(c, error.reason);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Random Book of the Day set!" }),
      dispatchEvents(["planner:updated"])
    ] })
  );
});
export {
  POST
};
