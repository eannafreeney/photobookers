import { Book, Creator } from "../../db/schema";
import { AuthUser } from "../../../types";
import Button from "../app/Button";
import { canDeleteBook } from "../../lib/permissions";

type Props = {
  book: Book & { artist: Creator; publisher: Creator };
  user: AuthUser | null;
};

const DeleteBookForm = ({ book, user }: Props) => {
  const attrs = {
    "x-target": "books-table toast",
    "x-target.error": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };

  return (
    <form
      method="post"
      action={`/dashboard/books/delete/${book.id}`}
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
