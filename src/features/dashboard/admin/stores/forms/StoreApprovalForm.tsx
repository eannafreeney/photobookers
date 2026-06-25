import type { BookStore } from "../../../../../db/schema";
import StoreApprovalStatusPill from "../components/StoreApprovalStatusPill";

type StoreApprovalFormProps = {
  store: BookStore;
};

const StoreApprovalForm = ({ store }: StoreApprovalFormProps) => {
  const isPending = store.approvalStatus === "pending";

  return (
    <div class="flex items-center gap-2" id="store-approval-status">
      <StoreApprovalStatusPill approvalStatus={store.approvalStatus} />
      {isPending && (
        <div class="flex gap-2">
          <form
            method="post"
            action={`/dashboard/admin/stores/${store.id}/approve`}
            x-target="store-approval-status"
          >
            <button type="submit" class="btn btn-success btn-sm">
              Approve
            </button>
          </form>
          <button
            type="button"
            class="btn btn-danger btn-sm"
            x-on:click={`$ajax('/dashboard/admin/stores/${store.id}/reject')`}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default StoreApprovalForm;
