import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AuthModal from "../../../../components/app/AuthModal";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import Alert from "../../../../components/app/Alert";
import {
  requestFairAttendance,
  withdrawFairAttendance,
  getAttendanceForCreator,
} from "../../../../features/fair-attendees/services";
import { notifyAdminFairAttendancePending } from "../../../../features/dashboard/admin/notifications/services";
import { db } from "../../../../db/client";
import { bookFairs } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import {
  canClaimFairAttendance,
  canWithdrawFairAttendance,
} from "../../../../lib/permissions";
import FairAttendButton from "../../../../features/app/fairs/components/FairAttendButton";
import type { FairAttendeeStatus } from "../../../../db/schema";

const getFairForAttend = async (fairId: string) => {
  return db.query.bookFairs.findFirst({
    where: eq(bookFairs.id, fairId),
    columns: {
      id: true,
      name: true,
      slug: true,
      status: true,
      approvalStatus: true,
      startDate: true,
      endDate: true,
    },
  });
};

const renderAttendResponse = async (
  c: Context,
  fairId: string,
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>,
  message: string,
  attendanceStatus: FairAttendeeStatus | null,
) => {
  const fair = await getFairForAttend(fairId);
  if (!fair) return showErrorAlert(c, "Fair not found");

  return c.html(
    <>
      <Alert type="success" message={message} />
      <FairAttendButton
        fair={fair}
        user={user}
        attendanceStatus={attendanceStatus}
      />
    </>,
  );
};

export const POST = createRoute(async (c: Context) => {
  const fairId = c.req.param("fairId");
  const user = await getUser(c);

  if (!user?.id) {
    return c.html(<AuthModal action="to mark yourself as attending this fair." />, 401);
  }

  if (!user.creator) {
    return showErrorAlert(c, "You need a creator profile to attend fairs");
  }

  const fair = await getFairForAttend(fairId);
  if (!fair) return showErrorAlert(c, "Fair not found");

  if (!canClaimFairAttendance(user, fair)) {
    return showErrorAlert(c, "You cannot request attendance at this fair");
  }

  const [attendanceError, existing] = await getAttendanceForCreator(
    fairId,
    user.creator.id,
  );
  if (attendanceError) return showErrorAlert(c, attendanceError.reason);
  if (existing) {
    return renderAttendResponse(
      c,
      fairId,
      user,
      existing.status === "pending"
        ? "Your attendance is already pending approval."
        : existing.status === "approved"
          ? "You are already attending this fair."
          : "Your attendance request was not approved.",
      existing.status,
    );
  }

  const [error, attendee] = await requestFairAttendance(
    fairId,
    user.creator.id,
  );
  if (error) return showErrorAlert(c, error.reason);

  await notifyAdminFairAttendancePending({
    fairId: fair.id,
    fairName: fair.name,
    creatorName: user.creator.displayName,
    actorUserId: user.id,
  });

  return renderAttendResponse(
    c,
    fairId,
    user,
    "Attendance request submitted. We'll notify you once it's approved.",
    attendee.status,
  );
});

export const DELETE = createRoute(async (c: Context) => {
  const fairId = c.req.param("fairId");
  const user = await getUser(c);

  if (!user?.id) {
    return c.html(<AuthModal action="to update your fair attendance." />, 401);
  }

  if (!user.creator) {
    return showErrorAlert(c, "You need a creator profile");
  }

  const fair = await getFairForAttend(fairId);
  if (!fair) return showErrorAlert(c, "Fair not found");

  if (!canWithdrawFairAttendance(user, fair, user.creator.id)) {
    return showErrorAlert(c, "You cannot withdraw from this fair");
  }

  const [error] = await withdrawFairAttendance(fairId, user.creator.id);
  if (error) return showErrorAlert(c, error.reason);

  return renderAttendResponse(
    c,
    fairId,
    user,
    "You are no longer marked as attending this fair.",
    null,
  );
});
