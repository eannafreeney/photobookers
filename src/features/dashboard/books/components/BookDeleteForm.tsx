import { Book, Creator } from "../../../../db/schema";
import { AuthUser } from "../../../../../types";
import Button from "../../../../components/app/Button";
import { canDeleteBook } from "../../../../lib/permissions";
import FormDelete from "../../../../components/forms/FormDelete";

type Props = {
  book: Book & { artist: Creator | null; publisher: Creator | null };
  user: AuthUser | null;
};

const DeleteBookForm = ({ book, user }: Props) => {
  const alpineAttrs = {
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax.success": "$dispatch('books:updated')",
  };

  return (
    <FormDelete action={`/dashboard/books/${book.id}`} {...alpineAttrs}>
      <Button
        variant="outline"
        color="danger"
        isDisabled={!canDeleteBook(user, book)}
      >
        <span>Delete</span>
      </Button>
    </FormDelete>
  );
};

export default DeleteBookForm;
