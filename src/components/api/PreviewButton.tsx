import { AuthUser } from "../../../types";
import { Book } from "../../db/schema";
import { previewIcon, viewIcon } from "../../lib/icons";
import { canPreviewBook } from "../../lib/permissions";
import Button from "../app/Button";
import Link from "../app/Link";

type Props = {
  book: Book;
  user: AuthUser | null;
};

const PreviewButton = ({ book, user }: Props) => {
  const bookId = book.id;

  if (book.publicationStatus === "published") {
    return (
      <div id={`preview-button-${bookId}`}>
        <Link href={`/books/${book.slug}`}>{viewIcon}</Link>
      </div>
    );
  }

  return (
    <div id={`preview-button-${bookId}`}>
      <Link href={`/books/preview/${book.slug}`} target="_blank">
        <button class="cursor-pointer" disabled={!canPreviewBook(user, book)}>
          {previewIcon}
        </button>
      </Link>
    </div>
  );
};

export default PreviewButton;
