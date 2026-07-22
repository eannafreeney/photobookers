import Button from "../../../../../components/app/Button";
import { Book } from "../../../../../db/schema";
import BookApprovalStatusPill from "../components/BookApprovalStatusPill";

type Props = { book: Book };

const BookApprovalForm = ({ book }: Props) => {
  const status = book.approvalStatus ?? "pending";

  if (status === "rejected") {
    return (
      <>
        <BookApprovalStatusPill approvalStatus={status} />;
        <form
          method="get"
          action={`/dashboard/admin/books/${book.id}/feedback`}
          x-target="modal-root"
        >
          <Button variant="outline" color="secondary">
            Send feedback
          </Button>
        </form>
      </>
    );
  }

  if (status === "approved") {
    return (
      <div
        id="book-approval-status"
        class="flex flex-col md:flex-row items-center gap-2"
      >
        <BookApprovalStatusPill approvalStatus={status} />
        <form
          method="post"
          action={`/dashboard/admin/books/${book.id}/unapprove`}
          x-target={`toast book-approval-status publish-toggle-${book.id}`}
        >
          <Button variant="outline" color="warning">
            Unapprove
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div
      id="book-approval-status"
      class="flex flex-col md:flex-row items-center gap-2"
    >
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

      <form
        method="get"
        action={`/dashboard/admin/books/${book.id}/feedback`}
        x-target="modal-root"
      >
        <Button variant="outline" color="secondary">
          Send feedback
        </Button>
      </form>
    </div>
  );
};

export default BookApprovalForm;
