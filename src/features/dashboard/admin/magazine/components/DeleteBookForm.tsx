import FormPost from "@/components/forms/FormPost";
import { deleteIcon } from "@/lib/icons";

type Props = {
  bookId: string;
  action: string;
};

const DeleteBookForm = ({ bookId, action }: Props) => {
  const alpineAttrs = {
    "x-target": "toast",
    "@ajax:before":
      "confirm('Remove this book from the issue?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('li').remove()",
  };
  return (
    <FormPost
      action={`${action}/remove-book`}
      {...alpineAttrs}
      className="shrink-0"
    >
      <input type="hidden" name="bookId" value={bookId} />
      <button
        type="submit"
        class="text-danger hover:opacity-80"
        title="Remove from issue"
      >
        {deleteIcon}
      </button>
    </FormPost>
  );
};

export default DeleteBookForm;
