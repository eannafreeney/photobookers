import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../../lib/validator.js";
import {
  publisherOfTheWeekFormSchema,
  weekQuerySchema
} from "../../../../../../features/dashboard/admin/planner/schema.js";
import SchedulePOTWModal from "../../../../../../features/dashboard/admin/planner/modals/SchedulePOTWModal.js";
import { setPublisherOfTheWeek } from "../../../../../../features/dashboard/admin/planner/services.js";
import Alert from "../../../../../../components/app/Alert.js";
import { showErrorAlert } from "../../../../../../lib/alertHelpers.js";
import { dispatchEvents } from "../../../../../../lib/disatchEvents.js";
const GET = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  return c.html(/* @__PURE__ */ jsx(SchedulePOTWModal, { week }));
});
const POST = createRoute(
  formValidator(publisherOfTheWeekFormSchema),
  async (c) => {
    const form = c.req.valid("form");
    const [error] = await setPublisherOfTheWeek({
      weekStart: form.weekStart,
      creatorId: form.creatorId
    });
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Publisher of the Week set!" }),
        dispatchEvents(["planner:updated"])
      ] })
    );
  }
);
export {
  GET,
  POST
};
