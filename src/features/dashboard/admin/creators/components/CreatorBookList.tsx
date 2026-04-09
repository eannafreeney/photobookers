import Button from "../../../../../components/app/Button";
import Link from "../../../../../components/app/Link";
import { Pagination } from "../../../../../components/app/Pagination";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import TableSearch from "../../../../../components/app/TableSearch";
import DeleteFormButton from "../../components/DeleteFormButton";
import { getBooksByCreatorId } from "../services";

type CreatorBookListProps = {
  creatorId: string;
  currentPath: string;
  currentPage: number;
  searchQuery?: string;
};

const CreatorBookList = async ({
  creatorId,
  currentPath,
  currentPage,
  searchQuery,
}: CreatorBookListProps) => {
  const [error, result] = await getBooksByCreatorId(
    creatorId,
    currentPage,
    searchQuery,
  );
  if (error) return <div>Error: {error.reason}</div>;

  const targetId = "creator-books-table-body";

  const { books, totalPages, page } = result;

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Books</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="creator-books-table"
          action={`/dashboard/admin/creators/${creatorId}`}
          placeholder="Filter books..."
        />
        <Link href="/dashboard/admin/books/create">
          <Button variant="solid" color="primary">
            New Book
          </Button>
        </Link>
      </div>
      <Table id="creator-books-table">
        <Table.Head>
          <Table.HeadRow>Cover</Table.HeadRow>
          <Table.HeadRow>Title</Table.HeadRow>
          <Table.HeadRow>Artist</Table.HeadRow>
          <Table.HeadRow>Publisher</Table.HeadRow>
        </Table.Head>
        <Table.Body id={targetId}>
          {books.map((book) => (
            <tr>
              <Table.BodyRow>
                <img
                  src={book.coverUrl ?? ""}
                  alt={book.title}
                  class="w-auto h-12"
                />
              </Table.BodyRow>
              <Table.BodyRow>{book.title}</Table.BodyRow>
              <Table.BodyRow>{book.artist?.displayName}</Table.BodyRow>
              <Table.BodyRow>{book.publisher?.displayName}</Table.BodyRow>
              <Table.BodyRow>
                <a href={`/dashboard/admin/books/${book.id}`}>
                  <Button variant="outline" color="inverse">
                    <span>Edit</span>
                  </Button>
                </a>
              </Table.BodyRow>
              <Table.BodyRow>
                <DeleteFormButton
                  action={`/dashboard/admin/books/${book.id}`}
                />
              </Table.BodyRow>
            </tr>
          ))}
        </Table.Body>
      </Table>
      <Pagination
        baseUrl={currentPath}
        page={page}
        totalPages={totalPages}
        targetId={targetId}
      />
    </div>
  );
};

export default CreatorBookList;
