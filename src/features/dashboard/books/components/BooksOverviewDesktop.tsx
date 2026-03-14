import TableSearch from "../../../../components/app/TableSearch";
import SectionTitle from "../../../../components/app/SectionTitle";
import Button from "../../../../components/app/Button";
import Link from "../../../../components/app/Link";
import { Book, Creator } from "../../../../db/schema";
import { AuthUser } from "../../../../../types";
import { Pagination } from "../../../../components/app/Pagination";
import PublisherBooksTable from "./PublisherBooksTable";
import ArtistBooksTable from "./ArtistBooksTable";

type Props = {
  books: (Book & { artist: Creator | null; publisher: Creator | null })[];
  user: AuthUser;
  totalPages: number;
  page: number;
  creatorType: "artist" | "publisher";
};

const BooksOverviewDesktop = ({
  books,
  user,
  totalPages,
  page,
  creatorType,
}: Props) => {
  const targetId = "books-table-body";

  const alpineAttrs = {
    "x-init": "true",
    "@books:updated.window":
      "$ajax('/dashboard/books', { target: 'books-table-body' })",
  };

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Books</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="books-table"
          action="/dashboard/books"
          placeholder="Filter books..."
        />
        <Link href="/dashboard/books/new">
          <Button variant="solid" color="primary">
            New Book
          </Button>
        </Link>
      </div>
      {creatorType === "artist" ? (
        <ArtistBooksTable
          books={books}
          user={user}
          targetId={targetId}
          alpineAttrs={alpineAttrs}
        />
      ) : (
        <PublisherBooksTable
          books={books}
          user={user}
          targetId={targetId}
          alpineAttrs={alpineAttrs}
        />
      )}
      <Pagination
        baseUrl="/dashboard/books"
        totalPages={totalPages}
        page={page}
        targetId={targetId}
      />
    </div>
  );
};

export default BooksOverviewDesktop;
