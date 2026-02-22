import { deleteIcon } from "../../lib/icons";

const DeleteBookForm = ({ bookId }: { bookId: string }) => {
  const alpineAttrs = {
    "x-init": "true",
    "x-target": "books-table toast",
    "x-target.error": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };
  return (
    <form
      method="post"
      action={`/dashboard/admin/books/delete/${bookId}`}
      {...alpineAttrs}
    >
      <button class="cursor-pointer">{deleteIcon}</button>
    </form>
  );
};
export default DeleteBookForm;
