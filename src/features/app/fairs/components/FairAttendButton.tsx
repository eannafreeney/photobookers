import type { BookFair, FairAttendeeStatus } from "../../../../db/schema";
import type { AuthUser } from "../../../../../types";
import Button from "../../../../components/app/Button";
import Link from "../../../../components/app/Link";
import {
  canClaimFairAttendance,
  canWithdrawFairAttendance,
} from "../../../../lib/permissions";
import FormDelete from "../../../../components/forms/FormDelete";

type FairAttendButtonProps = {
  fair: Pick<
    BookFair,
    "id" | "status" | "approvalStatus" | "endDate" | "startDate"
  >;
  user: AuthUser | null;
  attendanceStatus: FairAttendeeStatus | null;
};

const FairAttendButton = ({
  fair,
  user,
  attendanceStatus,
}: FairAttendButtonProps) => {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const isPastFair = new Date(fair.endDate) < today;

  if (isPastFair) return null;

  const buttonId = `fair-attend-${fair.id}`;
  const action = `/api/fairs/${fair.id}/attend`;

  const alpineAttrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
    "x-target": `${buttonId} toast modal-root`,
    "x-target.error": "toast modal-root",
    "x-target.401": "modal-root",
  };

  if (!user) {
    return (
      <div id={buttonId} class="pt-4 flex justify-center">
        <form method="post" action={action} {...alpineAttrs}>
          <Button variant="solid" color="primary" type="submit">
            <span x-show="!isSubmitting">I'm attending this fair</span>
            <span x-show="isSubmitting" x-cloak>
              Submitting...
            </span>
          </Button>
        </form>
      </div>
    );
  }

  if (!user.creator) {
    return (
      <div id={buttonId} class="pt-4 text-center text-sm text-on-surface-muted">
        <Link href="/dashboard" className="text-accent hover:underline">
          Set up your creator profile
        </Link>{" "}
        to mark yourself as attending.
      </div>
    );
  }

  if (user.creator.status !== "verified") {
    return (
      <div id={buttonId} class="pt-4 text-center text-sm text-on-surface-muted">
        Only verified creators can mark attendance at fairs.
      </div>
    );
  }

  if (attendanceStatus === "pending") {
    return (
      <div id={buttonId} class="pt-4 flex justify-center">
        <span class="px-4 py-2 text-sm font-medium text-on-surface-muted border border-outline rounded-radius">
          Pending approval
        </span>
      </div>
    );
  }

  if (attendanceStatus === "rejected") {
    return (
      <div id={buttonId} class="pt-4 flex justify-center">
        <span class="px-4 py-2 text-sm font-medium text-on-surface-muted border border-outline rounded-radius">
          Attendance not approved
        </span>
      </div>
    );
  }

  if (attendanceStatus === "approved") {
    const canWithdraw = canWithdrawFairAttendance(
      user,
      fair,
      user.creator.id,
    );

    return (
      <div id={buttonId} class="pt-4 flex flex-col items-center gap-2">
        <span class="px-4 py-2 text-sm font-medium text-accent border border-accent rounded-radius">
          You're attending
        </span>
        {canWithdraw && (
          <FormDelete action={action} {...alpineAttrs}>
            <button
              type="submit"
              class="text-sm text-on-surface-muted hover:text-accent underline underline-offset-4"
            >
              Withdraw
            </button>
          </FormDelete>
        )}
      </div>
    );
  }

  if (!canClaimFairAttendance(user, fair)) {
    return null;
  }

  return (
    <div id={buttonId} class="pt-4 flex justify-center">
      <form method="post" action={action} {...alpineAttrs}>
        <Button variant="solid" color="primary" type="submit">
          <span x-show="!isSubmitting">I'm attending this fair</span>
          <span x-show="isSubmitting" x-cloak>
            Submitting...
          </span>
        </Button>
      </form>
    </div>
  );
};

export default FairAttendButton;
