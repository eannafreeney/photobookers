import { AuthUser } from "../../../../types";
import { useUser } from "../../../contexts/UserContext";
import { Book, Creator } from "../../../db/schema";
import { canDeleteBook } from "../../../lib/permissions";
import { formatDate } from "../../../utils";
import PreviewButton from "../../api/PreviewButton";
import Button from "../../app/Button";
import PublishToggleForm from "../forms/PublishToggleForm";

type Props = {
  book: Book & { artist: Creator; publisher: Creator };
  user: AuthUser | null;
};

const BookTableRow = ({ book, user }: Props) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return <></>;
  }

  return (
    <tr>
      <td class="p-4">
        {book.coverUrl ? (
          <img src={book.coverUrl ?? ""} alt={book.title} class="w-auto h-12" />
        ) : (
          <a href={`/dashboard/books/edit/${book.id}#book-images`}>
            <Button variant="outline" color="warning">
              <span>Upload Cover</span>
            </Button>
          </a>
        )}
      </td>
      <td class="p-4">{book.title}</td>
      <td class="p-4">
        <a href={`/creators/${book.artist?.slug}`}>
          {book.artist?.displayName}
        </a>
      </td>
      <td class="p-4">
        {book.releaseDate
          ? book.releaseDate
              .toISOString()
              .slice(0, 10)
              .split("-")
              .reverse()
              .join("/")
          : ""}
      </td>
      <td class="p-4">
        <PublishToggleForm book={book} />
      </td>
      <td class="p-4">
        <PreviewButton book={book} />
      </td>
      <td class="p-4">
        <a href={`/dashboard/books/edit/${book.id}`}>
          <Button variant="outline" color="inverse">
            <span>Edit</span>
          </Button>
        </a>
      </td>
      <td class="p-4">
        <DeleteBookForm book={book} user={user} />
      </td>
    </tr>
  );
};

export default BookTableRow;

const DeleteBookForm = ({
  book,
  user,
}: {
  book: Book & { artist: Creator; publisher: Creator };
  user: AuthUser | null;
}) => {
  const attrs = {
    "x-target": "books-table toast",
    "x-target.error": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };
  return (
    <form
      method="POST"
      action={`/dashboard/books/delete/${book.id}`}
      {...attrs}
    >
      <Button
        variant="outline"
        color="danger"
        isDisabled={!canDeleteBook(user, book)}
      >
        <span>Delete</span>
      </Button>
    </form>
  );
};
