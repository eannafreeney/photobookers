import { Book, Creator } from "../../../db/schema";
import PreviewButton from "../../api/PreviewButton";
import Button from "../../app/Button";
import PublishToggleForm from "../forms/PublishToggleForm";

type Props = {
  book: Book & { artist: Creator; publisher: Creator };
  creatorType: "artist" | "publisher";
};

const ApproveBookTableRow = ({ book, creatorType }: Props) => {
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
        <form
          x-target="books-approval-table"
          method="POST"
          action={`/dashboard/books/${book.id}/approve`}
        >
          <Button variant="outline" color="success">
            <span>Approve</span>
          </Button>
        </form>
      </td>
      <td class="p-4">
        <form
          x-target="books-approval-table"
          method="POST"
          action={`/dashboard/books/${book.id}/reject`}
        >
          <Button variant="outline" color="danger">
            <span>Reject</span>
          </Button>
        </form>
      </td>
    </tr>
  );
};

export default ApproveBookTableRow;
