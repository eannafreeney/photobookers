import { AuthUser } from "../../../types";
import { Book } from "../../db/schema";
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
        <Link href={`/books/${book.slug}`}>
          <Button variant="outline" color="primary">
            <span>View</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div id={`preview-button-${bookId}`}>
      <Link href={`/books/preview/${book.slug}`} target="_blank">
        <Button
          variant="outline"
          color="primary"
          disabled={!canPreviewBook(user, book)}
        >
          <span>Preview</span>
        </Button>
      </Link>
    </div>
  );

  // return (
  //   <div id={`preview-button-${bookId}`}>
  //     <Link href={`/books/preview/${book.slug}`} target="_blank">
  //       <Button
  //         variant="outline"
  //         color="primary"
  //         disabled={!canPreviewBook(user, book)}
  //       >
  //         <span>Preview</span>
  //       </Button>
  //     </Link>
  //   </div>
  // );
};

export default PreviewButton;
