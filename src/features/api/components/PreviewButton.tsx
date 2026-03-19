import { AuthUser } from "../../../../types";
import { Book } from "../../../db/schema";
import { eyeIcon, eyeSlashIcon } from "../../../lib/icons";
import { canPreviewBook } from "../../../lib/permissions";
import Link from "../../../components/app/Link";

type Props = {
  book: Book;
  user: AuthUser | null;
};

const PreviewButton = ({ book, user }: Props) => {
  const bookId = book.id;

  if (book.publicationStatus === "published") {
    return (
      <div id={`preview-button-${bookId}`}>
        <Link href={`/books/${book.slug}`}>{eyeIcon()}</Link>
      </div>
    );
  }

  return (
    <div id={`preview-button-${bookId}`}>
      <Link href={`/books/preview/${book.slug}`} target="_blank">
        <button class="cursor-pointer" disabled={!canPreviewBook(user, book)}>
          {eyeSlashIcon()}
        </button>
      </Link>
    </div>
  );
};

export default PreviewButton;
