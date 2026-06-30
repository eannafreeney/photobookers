import Button from "../../../../../components/app/Button";
import type { BookStore } from "../../../../../db/schema";
import StatusPill from "../../components/StatusPill";

type StoreApprovalFormProps = {
  store: BookStore;
};

const StoreApprovalForm = ({ store }: StoreApprovalFormProps) => {
  const isPending = store.approvalStatus === "pending";

  return (
    <div class="flex items-center gap-2" id="store-approval-status">
      <StatusPill status={store.approvalStatus} />
      {isPending && (
        <div class="flex gap-2">
          <form
            method="post"
            action={`/dashboard/admin/stores/${store.id}/approve`}
            x-target="store-approval-status"
          >
            <Button variant="solid" color="success">
              Approve
            </Button>
          </form>
          <a
            href={`/dashboard/admin/stores/${store.id}/reject`}
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

export default StoreApprovalForm;
