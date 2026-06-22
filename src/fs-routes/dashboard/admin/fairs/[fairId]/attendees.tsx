import { createRoute } from "hono-fsr";
import { paramValidator, formValidator } from "../../../../../lib/validator";
import {
  fairIdSchema,
  attendeeSchema,
} from "../../../../../features/dashboard/admin/fairs/schema";
import {
  addAttendeeToFair,
  getAttendeesForFair,
  removeAttendeeFromFair,
} from "../../../../../features/dashboard/admin/fairs/services";
import { showErrorAlert, showSuccessAlert } from "../../../../../lib/alertHelpers";
import { Context } from "hono";
import AttendeesList from "../../../../../features/dashboard/admin/fairs/components/AttendeesList";
import { dispatchEvents } from "../../../../../lib/disatchEvents";
import { AttendeeFormContext, FairIdContext } from "../../../../../features/dashboard/admin/fairs/types";

export const GET = createRoute(
  paramValidator(fairIdSchema),
  async (c: Context) => {
    const fairId = c.req.param("fairId");

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
    const { creatorId } = c.req.valid("form");

    const [error] = await addAttendeeToFair(fairId, creatorId);
    if (error) return showErrorAlert(c, error.reason);

    const [listError, attendees] = await getAttendeesForFair(fairId);
    if (listError) return showErrorAlert(c, listError.reason);

    return c.html(
      <>
        {showSuccessAlert(c, "Attendee added successfully")}
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
    const fairId = c.req.param("fairId");
    const creatorId = c.req.query("creatorId");

    if (!creatorId) {
      return showErrorAlert(c, "Creator ID is required");
    }

    const [error] = await removeAttendeeFromFair(fairId, creatorId);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(dispatchEvents(["attendees:updated"]));
  },
);
