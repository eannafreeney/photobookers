import { Book, Creator } from "../../../../db/schema";
import { AuthUser } from "../../../../../types";
import Button from "../../../../components/app/Button";
import { canDeleteBook } from "../../../../lib/permissions";

type Props = {
  book: Book & { artist: Creator | null; publisher: Creator | null };
  user: AuthUser | null;
};

const DeleteBookForm = ({ book, user }: Props) => {
  const attrs = {
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax.success": "$dispatch('books:updated')",
  };

  return (
    <form
      method="post"
      action={`/dashboard/books/${book.id}/delete`}
      {...attrs}
    >
      <Button
        variant="outline"
        color="danger"
        isDisabled={!canDeleteBook(user, book)}
      >
        <span>Delete</span>
      </Button>
    </form>
  );
};

export default DeleteBookForm;
