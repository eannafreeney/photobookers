import type { BookFair } from "../../../../../db/schema";
import FairApprovalStatusPill from "../components/FairApprovalStatusPill";

type FairApprovalFormProps = {
  fair: BookFair;
};

const FairApprovalForm = ({ fair }: FairApprovalFormProps) => {
  const isPending = fair.approvalStatus === "pending";

  return (
    <div class="flex items-center gap-2" id="fair-approval-status">
      <FairApprovalStatusPill approvalStatus={fair.approvalStatus} />
      {isPending && (
        <div class="flex gap-2">
          <form
            method="post"
            action={`/dashboard/admin/fairs/${fair.id}/approve`}
            x-target="fair-approval-status"
          >
            <button type="submit" class="btn btn-success btn-sm">
              Approve
            </button>
          </form>
          <button
            type="button"
            class="btn btn-danger btn-sm"
            x-on:click={`$ajax('/dashboard/admin/fairs/${fair.id}/reject')`}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default FairApprovalForm;
