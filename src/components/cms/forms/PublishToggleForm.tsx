import { Book } from "../../../db/schema";
import ToggleButton from "../ui/ToggleButton";

type Props = {
  book: Book;
};

const PublishToggleForm = ({ book }: Props) => {
  const bookId = book.id;
  const publicationStatus = book.publicationStatus ?? "draft";
  const isPublished = publicationStatus === "published";

  return (
    <form
      id={`mode-form-${bookId}`}
      x-target={`mode-form-${bookId} preview-button-${bookId} notification-message`}
      {...{ "x-target.back": `notification-message mode-form-${bookId}` }}
      x-data={`{ isPublished: ${isPublished} }`}
      method="POST"
      action={
        isPublished
          ? `/dashboard/books/${bookId}/unpublish`
          : `/dashboard/books/${bookId}/publish`
      }
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
