import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../../lib/validator";
import { attendeeIdSchema } from "../../../../../../../features/dashboard/admin/fairs/schema";
import { rejectFairAttendee } from "../../../../../../../features/fair-attendees/services";
import { getAttendeesForFair } from "../../../../../../../features/dashboard/admin/fairs/services";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../lib/alertHelpers";
import AttendeesList from "../../../../../../../features/dashboard/admin/fairs/components/AttendeesList";
import { dispatchEvents } from "../../../../../../../lib/disatchEvents";
import { Context } from "hono";
import { routeParam } from "../../../../../../../lib/routeParam";

export const POST = createRoute(
  paramValidator(attendeeIdSchema),
  async (c: Context) => {
    const fairId = routeParam(c, "fairId");
    const attendeeId = routeParam(c, "attendeeId");

    const [error] = await rejectFairAttendee(attendeeId);
    if (error) return showErrorAlert(c, error.reason);

    const [listError, attendees] = await getAttendeesForFair(fairId);
    if (listError) return showErrorAlert(c, listError.reason);

    return c.html(
      <>
        {showSuccessAlert(c, "Attendee rejected")}
        <div id="attendees-list" x-merge="morph">
          <AttendeesList attendees={attendees} fairId={fairId} />
        </div>
        {dispatchEvents(["attendees:updated"])}
      </>,
    );
  },
);
