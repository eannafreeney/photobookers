import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../../lib/validator.js";
import { attendeeIdSchema } from "../../../../../../../features/dashboard/admin/fairs/schema.js";
import { rejectFairAttendee } from "../../../../../../../features/fair-attendees/services.js";
import { getAttendeesForFair } from "../../../../../../../features/dashboard/admin/fairs/services.js";
import {
  showErrorAlert,
  showSuccessAlert
} from "../../../../../../../lib/alertHelpers.js";
import AttendeesList from "../../../../../../../features/dashboard/admin/fairs/components/AttendeesList.js";
import { dispatchEvents } from "../../../../../../../lib/disatchEvents.js";
import { routeParam } from "../../../../../../../lib/routeParam.js";
const POST = createRoute(
  paramValidator(attendeeIdSchema),
  async (c) => {
    const fairId = routeParam(c, "fairId");
    const attendeeId = routeParam(c, "attendeeId");
    const [error] = await rejectFairAttendee(attendeeId);
    if (error) return showErrorAlert(c, error.reason);
    const [listError, attendees] = await getAttendeesForFair(fairId);
    if (listError) return showErrorAlert(c, listError.reason);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        showSuccessAlert(c, "Attendee rejected"),
        /* @__PURE__ */ jsx("div", { id: "attendees-list", "x-merge": "morph", children: /* @__PURE__ */ jsx(AttendeesList, { attendees, fairId }) }),
        dispatchEvents(["attendees:updated"])
      ] })
    );
  }
);
export {
  POST
};
