import Button from "../../../../../components/app/Button";
import { Book } from "../../../../../db/schema";
import BookApprovalStatusPill from "../components/BookApprovalStatusPill";

type Props = { book: Book };

const BookApprovalForm = ({ book }: Props) => {
  const status = book.approvalStatus ?? "pending";
  const isPending = status === "pending";

  if (!isPending) {
    return <BookApprovalStatusPill approvalStatus={status} />;
  }

  return (
    <div id="book-approval-status" class="flex items-center gap-2">
      <form
        method="post"
        action={`/dashboard/admin/books/${book.id}/approve`}
        x-target="toast book-approval-status"
      >
        <Button variant="outline" color="success">
          Approve
        </Button>
      </form>

      <form
        method="get"
        action={`/dashboard/admin/books/${book.id}/reject`}
        x-target="modal-root"
      >
        <Button variant="outline" color="danger">
          Reject
        </Button>
      </form>
    </div>
  );
};

export default BookApprovalForm;
