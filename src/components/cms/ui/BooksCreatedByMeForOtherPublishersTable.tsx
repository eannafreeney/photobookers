import { useUser } from "../../../contexts/UserContext";
import { Book, Creator } from "../../../db/schema";
import { getBooksByCreatorIdForOtherPublishers } from "../../../services/books";
import Button from "../../app/Button";
import SectionTitle from "../../app/SectionTitle";
import ApprovalBadge from "./ApprovalBadge";

const BooksCreatedByMeForOtherPublishersTable = async () => {
  const user = useUser();
  const books = await getBooksByCreatorIdForOtherPublishers(user ?? null);

  const validBooks = books?.filter((book) => book != null);

  if (validBooks?.length === 0) {
    return <></>;
  }

  return (
    <div>
      <SectionTitle>Books Created by Me for Other Publishers</SectionTitle>
      <p>
        Books created by you for claimed publishers. You can edit, delete or
        publish the book as long as the book is pending.
      </p>
      <div class="overflow-hidden w-full overflow-x-auto rounded-radius border border-outline">
        <table
          id="books-other-publishers-table"
          class="w-full text-left text-sm text-on-surface"
        >
          <thead class="border-b border-outline bg-surface-alt text-sm text-on-surface-strong">
            <tr>
              <th class="p-4">Cover</th>
              <th class="p-4">Title</th>
              <th class="p-4">Publisher</th>
              <th class="p-4">Release Date</th>
              <th class="p-4">Approval Status</th>
              <th class="p-4"></th>
              <th class="p-4"></th>
              <th class="p-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline">
            {validBooks?.map((book) => (
              <BookTableRow book={book} creatorType="publisher" />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BooksCreatedByMeForOtherPublishersTable;

type BookTableRowProps = {
  book: Book & { artist: Creator; publisher: Creator };
};

const BookTableRow = ({ book }: BookTableRowProps) => {
  return (
    <tr>
      <td class="p-4">
        {book.coverUrl ? (
          <img src={book.coverUrl ?? ""} alt={book.title} class="w-auto h-12" />
        ) : (
          <a href={`/dashboard/books/edit/${book.id}`}>
            <Button
              variant="outline"
              color="warning"
              isDisabled={book.approvalStatus !== "pending"}
            >
              <span>Upload Cover</span>
            </Button>
          </a>
        )}
      </td>
      <td class="p-4">{book.title}</td>
      <td class="p-4">
        <a href={`/creators/${book.publisher?.slug}`}>
          {book.publisher?.displayName}
        </a>
      </td>
      <td class="p-4">
        {book.releaseDate
          ? new Date(book.releaseDate).toLocaleDateString()
          : ""}
      </td>
      <td class="p-4">
        <ApprovalBadge approvalStatus={book.approvalStatus ?? "pending"} />
      </td>

      <td class="p-4">
        <a href={`/dashboard/books/edit/${book.id}`}>
          <Button
            variant="outline"
            color="inverse"
            isDisabled={book.approvalStatus !== "pending"}
          >
            <span>Edit</span>
          </Button>
        </a>
      </td>
      <td class="p-4">
        <form
          x-target="books-other-publishers-table"
          method="POST"
          action={`/dashboard/books/delete/${book.id}`}
          x-init
          {...{
            "@ajax:before":
              "confirm('Are you sure?') || $event.preventDefault()",
          }}
        >
          <Button
            variant="outline"
            color="danger"
            isDisabled={book.approvalStatus !== "pending"}
          >
            <span>Delete</span>
          </Button>
        </form>
      </td>
    </tr>
  );
};
