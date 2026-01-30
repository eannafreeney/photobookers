import { useUser } from "../../../contexts/UserContext";
import { getBooksForApproval } from "../../../services/books";
import SectionTitle from "../../app/SectionTitle";
import ApproveBookTableRow from "./ApproveBookTableRow";
import BookTableRow from "./BookTableRow";

const BooksForApprovalTable = async ({ creatorId }: { creatorId: string }) => {
  const books = await getBooksForApproval(creatorId);

  const validBooks = books?.filter((book) => book != null);

  if (validBooks?.length === 0) {
    return <></>;
  }

  return (
    <div>
      <SectionTitle>Books For Approval</SectionTitle>
      <p>
        Books created by others that are waiting for your approval to be added
        to your catalogue. You can approve or reject them by clicking the
        buttons below.
      </p>
      <div class="overflow-hidden w-full overflow-x-auto rounded-radius border border-outline">
        <table
          id="books-approval-table"
          class="w-full text-left text-sm text-on-surface"
        >
          <thead class="border-b border-outline bg-surface-alt text-sm text-on-surface-strong">
            <tr>
              <th class="p-4">Title</th>
              <th class="p-4">Artist</th>
              <th class="p-4">Release Date</th>
              <th class="p-4"></th>
              <th class="p-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline">
            {validBooks?.map((book) => (
              <ApproveBookTableRow book={book} creatorType="artist" />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BooksForApprovalTable;
