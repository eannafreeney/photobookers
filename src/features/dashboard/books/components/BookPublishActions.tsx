import { Book } from "../../../../db/schema";
import { canPublishBook, canPreviewBook, canUnpublishBook } from "../../../../lib/permissions";
import { AuthUser } from "../../../../../types";
import FormPatch from "../../../../components/forms/FormPatch";
import Button, { button } from "../../../../components/app/Button";
import Link from "../../../../components/app/Link";
import { eyeIcon, eyeSlashIcon } from "../../../../lib/icons";

type Props = {
  book: Book;
  user: AuthUser;
};

/** Labeled publish + preview controls for the book edit page (tables keep PublishToggleForm). */
const BookPublishActions = ({ book, user }: Props) => {
  const bookId = book.id;
  const isPublished = (book.publicationStatus ?? "draft") === "published";
  const intent = isPublished ? "unpublish" : "publish";
  const canToggle = isPublished
    ? canUnpublishBook(user, book)
    : canPublishBook(user, book);

  const previewHref = isPublished
    ? `/books/${book.slug}`
    : `/books/preview/${book.slug}`;
  const previewLabel = isPublished ? "View live" : "View preview";
  const canOpenPreview = isPublished || canPreviewBook(user, book);
  const previewClass = `${button({
    variant: "outline",
    color: "inverse",
    width: "fit",
  })} inline-flex items-center justify-center`;

  const alpineAttrs = {
    "x-target": `publish-toggle-${bookId} preview-button-${bookId} toast`,
    "x-target.error": "toast",
    "x-target.back": `toast publish-toggle-${bookId}`,
  };

  return (
    <>
      <FormPatch
        id={`publish-toggle-${bookId}`}
        action={`/dashboard/books/${bookId}`}
        {...alpineAttrs}
      >
        <input type="hidden" name="intent" value={intent} />
        <input type="hidden" name="controls" value="page" />
        <Button
          variant={isPublished ? "outline" : "solid"}
          color={isPublished ? "warning" : "success"}
          width="fit"
          isDisabled={!canToggle}
        >
          {isPublished ? "Unpublish" : "Publish book"}
        </Button>
      </FormPatch>
      <div id={`preview-button-${bookId}`}>
        {canOpenPreview ? (
          <Link href={previewHref} target="_blank" className={previewClass}>
            <span class="inline-flex items-center gap-2">
              {isPublished ? eyeIcon(4) : eyeSlashIcon(4)}
              {previewLabel}
            </span>
          </Link>
        ) : (
          <span
            class={`${previewClass} opacity-25 cursor-not-allowed`}
            title="Add a cover image to preview"
            aria-disabled="true"
          >
            <span class="inline-flex items-center gap-2">
              {eyeSlashIcon(4)}
              {previewLabel}
            </span>
          </span>
        )}
      </div>
    </>
  );
};

export default BookPublishActions;
