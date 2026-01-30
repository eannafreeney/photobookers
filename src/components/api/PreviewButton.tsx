import { Book } from "../../db/schema";
import Button from "../app/Button";
import Link from "../app/Link";

type Props = {
  book: Book;
};

const PreviewButton = ({ book }: Props) => {
  const bookId = book.id;
  const publicationStatus = book.publicationStatus ?? "draft";
  const isPublished = publicationStatus === "published";

  return (
    <div id={`preview-button-${bookId}`}>
      <Link href={`/books/preview/${bookId}`}>
        <Button
          variant="outline"
          color="primary"
          disabled={isPublished || !book.coverUrl}
        >
          <span>Preview</span>
        </Button>
      </Link>
    </div>
  );
};

export default PreviewButton;
