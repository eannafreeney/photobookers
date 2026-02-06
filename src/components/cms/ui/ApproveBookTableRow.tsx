import { Book, Creator } from "../../../db/schema";
import Button from "../../app/Button";

type Props = {
  book: Book & { artist: Creator; publisher: Creator };
  creatorType: "artist" | "publisher";
};

const ApproveBookTableRow = ({ book }: Props) => {
  return (
    <tr>
      <td class="p-4">{book.title}</td>
      <td class="p-4">
        <a href={`/creators/${book.artist?.slug}`}>
          {book.artist?.displayName}
        </a>
      </td>
      <td class="p-4">
        {book.releaseDate
          ? new Date(book.releaseDate).toLocaleDateString()
          : ""}
      </td>
      <td class="p-4">
        <a href={`/dashboard/books/edit/${book.id}`}>
          <Button variant="outline" color="inverse">
            <span>Edit</span>
          </Button>
        </a>
      </td>
      <td class="p-4">
        <ApproveBookForm bookId={book.id} />
      </td>
      <td class="p-4">
        <RejectBookForm bookId={book.id} />
      </td>
    </tr>
  );
};

export default ApproveBookTableRow;

const ApproveBookForm = ({ bookId }: { bookId: string }) => {
  const attrs = {
    "x-target": "books-approval-table toast",
    "x-target.error": "toast",
  };
  return (
    <form
      {...attrs}
      method="post"
      action={`/dashboard/books/${bookId}/approve`}
    >
      <Button variant="outline" color="success">
        <span>Approve</span>
      </Button>
    </form>
  );
};

const RejectBookForm = ({ bookId }: { bookId: string }) => {
  const attrs = {
    "x-target": "books-approval-table toast",
    "x-target.error": "toast",
  };
  return (
    <form {...attrs} method="post" action={`/dashboard/books/${bookId}/reject`}>
      <Button variant="outline" color="danger">
        <span>Reject</span>
      </Button>
    </form>
  );
};
