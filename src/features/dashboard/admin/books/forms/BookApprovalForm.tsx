import Button from "../../../../../components/app/Button";
import Pill from "../../../../../components/app/Pill";
import { Book } from "../../../../../db/schema";
import { capitalize } from "../../../../../utils";
import BookApprovalStatusPill from "../components/BookApprovalStatusPill";

type Props = { book: Book };

const BookApprovalForm = ({ book }: Props) => {
  const action = `/dashboard/admin/books/${book.id}/approval`;
  const status = book.approvalStatus ?? "pending";
  const isPending = status === "pending";

  if (!isPending) {
    return <BookApprovalStatusPill approvalStatus={status} />;
  }

  return (
    <div id="book-approval-status" class="flex items-center gap-2">
      {/* Approve */}
      <form
        method="post"
        action={`/dashboard/admin/books/${book.id}/approve`}
        x-target="toast book-approval-status"
      >
        <Button variant="outline" color="success">
          Approve
        </Button>
      </form>

      {/* Reject — opens modal */}
      <form
        method="get"
        action={`/dashboard/admin/books/${book.id}/reject`}
        x-target="modal-root"
      >
        <Button variant="outline" color="danger">
          Reject
        </Button>
      </form>

      {/* Reject modal */}
      <dialog
        x-effect="rejectOpen ? $el.showModal() : $el.close()"
        class="modal z-1"
      >
        <div class="modal-box bg-surface-alt rounded-radius">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium">Reject book</h3>
            <button
              type="button"
              x-on:click="rejectOpen = false"
              class="btn btn-sm btn-circle btn-ghost cursor-pointer"
            >
              ✕
            </button>
          </div>
          <form method="post" action={action} class="flex flex-col gap-3">
            <input type="hidden" name="intent" value="reject" />
            <label class="text-sm text-on-surface-muted">
              Feedback for the creator (required)
            </label>
            <textarea
              name="feedback"
              rows={4}
              required
              placeholder="e.g. The cover image resolution is too low. Please upload a higher quality image."
              class="w-full rounded-radius border border-outline bg-surface p-2 text-sm"
            />
            <div class="flex justify-end gap-2">
              <button
                type="button"
                x-on:click="rejectOpen = false"
                class="cursor-pointer px-3 py-1.5 rounded-radius border border-outline text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="cursor-pointer px-3 py-1.5 rounded-radius bg-danger text-on-danger text-sm"
              >
                Send feedback &amp; reject
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default BookApprovalForm;
