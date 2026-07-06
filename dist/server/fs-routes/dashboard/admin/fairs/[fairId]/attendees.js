import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator, formValidator } from "../../../../../lib/validator.js";
import {
  fairIdSchema,
  attendeeSchema
} from "../../../../../features/dashboard/admin/fairs/schema.js";
import {
  addAttendeesToFair,
  getAttendeesForFair,
  removeAttendeeFromFair
} from "../../../../../features/dashboard/admin/fairs/services.js";
import { showErrorAlert, showSuccessAlert } from "../../../../../lib/alertHelpers.js";
import AttendeesList from "../../../../../features/dashboard/admin/fairs/components/AttendeesList.js";
import { dispatchEvents } from "../../../../../lib/disatchEvents.js";
import { routeParam } from "../../../../../lib/routeParam.js";
const GET = createRoute(
  paramValidator(fairIdSchema),
  async (c) => {
    const fairId = routeParam(c, "fairId");
    const [error, attendees] = await getAttendeesForFair(fairId);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(/* @__PURE__ */ jsx(AttendeesList, { attendees, fairId }));
  }
);
const POST = createRoute(
  formValidator(attendeeSchema),
  paramValidator(fairIdSchema),
  async (c) => {
    const fairId = c.req.valid("param").fairId;
    const { creatorIds } = c.req.valid("form");
    const [error, result] = await addAttendeesToFair(fairId, creatorIds);
    if (error) return showErrorAlert(c, error.reason);
    const [listError, attendees] = await getAttendeesForFair(fairId);
    if (listError) return showErrorAlert(c, listError.reason);
    const successMessage = result.skippedCount > 0 ? `${result.addedCount} attendee${result.addedCount === 1 ? "" : "s"} added (${result.skippedCount} already on the list)` : `${result.addedCount} attendee${result.addedCount === 1 ? "" : "s"} added successfully`;
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        showSuccessAlert(c, successMessage),
        /* @__PURE__ */ jsx("div", { id: "attendees-list", "x-merge": "morph", children: /* @__PURE__ */ jsx(AttendeesList, { attendees, fairId }) }),
        dispatchEvents(["attendees:updated"])
      ] })
    );
  }
);
const DELETE = createRoute(
  paramValidator(fairIdSchema),
  async (c) => {
    const fairId = routeParam(c, "fairId");
    const creatorId = c.req.query("creatorId");
    if (!creatorId) {
      return showErrorAlert(c, "Creator ID is required");
    }
    const [error] = await removeAttendeeFromFair(fairId, creatorId);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(dispatchEvents(["attendees:updated"]));
  }
);
export {
  DELETE,
  GET,
  POST
};
