import { Book, Creator } from "../../../db/schema";
import PreviewButton from "../../api/PreviewButton";
import Button from "../../app/Button";
import PublishToggleForm from "../forms/PublishToggleForm";

type Props = {
  book: Book & { artist: Creator; publisher: Creator };
  creatorType: "artist" | "publisher";
};

const BookTableRow = ({ book, creatorType }: Props) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return <></>;
  }

  return (
    <tr>
      <td class="p-4">
        {book.coverUrl ? (
          <img src={book.coverUrl ?? ""} alt={book.title} class="w-auto h-12" />
        ) : (
          <a href={`/dashboard/books/edit/${book.id}`}>
            <Button variant="outline" color="warning">
              <span>Upload Cover</span>
            </Button>
          </a>
        )}
      </td>
      <td class="p-4">{book.title}</td>
      <td class="p-4">
        <a href={`/creators/${book[creatorType]?.slug}`}>
          {book[creatorType]?.displayName}
        </a>
      </td>
      <td class="p-4">
        {book.releaseDate
          ? new Date(book.releaseDate).toLocaleDateString()
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
          <Button
            variant="outline"
            color="inverse"
            isDisabled={book.publisher.status === "stub"}
          >
            <span>Edit</span>
          </Button>
        </a>
      </td>
      <td class="p-4">
        <form
          x-target="books-table"
          method="POST"
          action={`/dashboard/books/delete/${book.id}`}
          x-init
          {...{
            "@ajax:before":
              "confirm('Are you sure?') || $event.preventDefault()",
          }}
        >
          <Button variant="outline" color="danger">
            <span>Delete</span>
          </Button>
        </form>
      </td>
    </tr>
  );
};

export default BookTableRow;
