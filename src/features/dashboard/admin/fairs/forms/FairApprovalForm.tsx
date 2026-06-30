import Button from "../../../../../components/app/Button";
import type { BookFair } from "../../../../../db/schema";
import StatusPill from "../../components/StatusPill";

type FairApprovalFormProps = {
  fair: BookFair;
};

const FairApprovalForm = ({ fair }: FairApprovalFormProps) => {
  const isPending = fair.approvalStatus === "pending";

  return (
    <div class="flex items-center gap-2" id="fair-approval-status">
      <StatusPill status={fair.approvalStatus} />
      {isPending && (
        <div class="flex gap-2">
          <form
            method="post"
            action={`/dashboard/admin/fairs/${fair.id}/approve`}
            x-target="fair-approval-status"
          >
            <Button variant="solid" color="success">
              Approve
            </Button>
          </form>

          <a
            href={`/dashboard/admin/fairs/${fair.id}/reject`}
            x-target="modal-root"
          >
            <Button variant="solid" color="danger">
              Reject
            </Button>
          </a>
        </div>
      )}
    </div>
  );
};

export default FairApprovalForm;
