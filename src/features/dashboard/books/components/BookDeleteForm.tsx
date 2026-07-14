import { Book, Creator } from "../../../../db/schema";
import { AuthUser } from "../../../../../types";
import Button from "../../../../components/app/Button";
import { canDeleteBook } from "../../../../lib/permissions";
import FormDelete from "../../../../components/forms/FormDelete";

type Props = {
  book: Book & {
    artist: Pick<Creator, "id" | "displayName" | "slug"> | null;
    publisher: Pick<Creator, "id" | "displayName" | "slug"> | null;
  };
  user: AuthUser | null;
  /** Base for the delete route (e.g. "/dashboard/admin/books"). */
  basePath?: string;
};

const DeleteBookForm = ({
  book,
  user,
  basePath = "/dashboard/books",
}: Props) => {
  const alpineAttrs = {
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax.success": "$dispatch('books:updated')",
  };

  return (
    <FormDelete action={`${basePath}/${book.id}`} {...alpineAttrs}>
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
