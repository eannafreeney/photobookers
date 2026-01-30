import { Book } from "../../../db/schema";
import ToggleButton from "../ui/ToggleButton";

type Props = {
  book: Book;
};

const PublishToggleForm = ({ book }: Props) => {
  const bookId = book.id;
  const publicationStatus = book.publicationStatus ?? "draft";
  const isPublished = publicationStatus === "published";

  const alpineAttrs = {
    "x-data": `{ isPublished: ${isPublished} }`,
    "x-target": `mode-form-${bookId} preview-button-${bookId} toast`,
    "x-target.error": "toast",
    "x-on:ajax:error": `isPublished = ${isPublished}`,
    "x-target.back": `toast mode-form-${bookId}`,
  };

  return (
    <form
      id={`mode-form-${bookId}`}
      method="POST"
      action={
        isPublished
          ? `/dashboard/books/${bookId}/unpublish`
          : `/dashboard/books/${bookId}/publish`
      }
      {...alpineAttrs}
    >
      <div
        class="tooltip"
        data-tip={
          !book.coverUrl && publicationStatus === "draft"
            ? "Can't publish without a cover image"
            : ""
        }
      >
        <ToggleButton
          isChecked={isPublished}
          name="isPublished"
          onChange="$root.requestSubmit()"
        />
      </div>
    </form>
  );
};
export default PublishToggleForm;
