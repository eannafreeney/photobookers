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
    "x-target": `publish-toggle-${bookId} preview-button-${bookId} toast`,
    "x-target.error": "toast",
    "x-on:ajax:error": `isPublished = ${isPublished}`,
    "x-target.back": `toast publish-toggle-${bookId}`,
  };

  return (
    <form
      id={`publish-toggle-${bookId}`}
      method="POST"
      action={`/dashboard/books/${bookId}/${
        isPublished ? "unpublish" : "publish"
      }`}
      {...alpineAttrs}
    >
      <ToggleButton
        isChecked={isPublished}
        name="isPublished"
        onChange="$root.requestSubmit()"
      />
    </form>
  );
};
export default PublishToggleForm;
