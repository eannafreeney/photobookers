import { createRoute } from "hono-fsr";
import { paramValidator, formValidator } from "../../../../../lib/validator";
import {
  fairIdSchema,
  attendeeSchema,
} from "../../../../../features/dashboard/admin/fairs/schema";
import {
  addAttendeesToFair,
  getAttendeesForFair,
  removeAttendeeFromFair,
} from "../../../../../features/dashboard/admin/fairs/services";
import { showErrorAlert, showSuccessAlert } from "../../../../../lib/alertHelpers";
import { Context } from "hono";
import AttendeesList from "../../../../../features/dashboard/admin/fairs/components/AttendeesList";
import { dispatchEvents } from "../../../../../lib/disatchEvents";
import { AttendeeFormContext, FairIdContext } from "../../../../../features/dashboard/admin/fairs/types";
import { routeParam } from "../../../../../lib/routeParam";

export const GET = createRoute(
  paramValidator(fairIdSchema),
  async (c: Context) => {
    const fairId = routeParam(c, "fairId");

    const [error, attendees] = await getAttendeesForFair(fairId);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(<AttendeesList attendees={attendees} fairId={fairId} />);
  },
);

export const POST = createRoute(
  formValidator(attendeeSchema),
  paramValidator(fairIdSchema),
  async (c: AttendeeFormContext) => {
    const fairId = c.req.valid("param").fairId;
    const { creatorIds } = c.req.valid("form");

    const [error, result] = await addAttendeesToFair(fairId, creatorIds);
    if (error) return showErrorAlert(c, error.reason);

    const [listError, attendees] = await getAttendeesForFair(fairId);
    if (listError) return showErrorAlert(c, listError.reason);

    const successMessage =
      result.skippedCount > 0
        ? `${result.addedCount} attendee${result.addedCount === 1 ? "" : "s"} added (${result.skippedCount} already on the list)`
        : `${result.addedCount} attendee${result.addedCount === 1 ? "" : "s"} added successfully`;

    return c.html(
      <>
        {showSuccessAlert(c, successMessage)}
        <div id="attendees-list" x-merge="morph">
          <AttendeesList attendees={attendees} fairId={fairId} />
        </div>
        {dispatchEvents(["attendees:updated"])}
      </>,
    );
  },
);

export const DELETE = createRoute(
  paramValidator(fairIdSchema),
  async (c: Context) => {
    const fairId = routeParam(c, "fairId");
    const creatorId = c.req.query("creatorId");

    if (!creatorId) {
      return showErrorAlert(c, "Creator ID is required");
    }

    const [error] = await removeAttendeeFromFair(fairId, creatorId);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(dispatchEvents(["attendees:updated"]));
  },
);
