import Button from "../../../../../components/app/Button";
import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import TableSearch from "../../../../../components/app/TableSearch";
import { getAllBooksAdmin } from "../services";
import AdminBooksTableAndFilter from "./AdminBooksTableAndFilter";
import { AuthUser } from "../../../../../../types";

type Props = {
  currentPath: string;
  currentPage: number;
  searchQuery?: string;
  user: AuthUser | null;
};

const AdminBooksTable = async ({
  currentPath,
  currentPage,
  searchQuery,
  user,
}: Props) => {
  const result = await getAllBooksAdmin(currentPage, searchQuery);

  if (!result?.books) {
    return <div>No featured books found</div>;
  }

  const { books, totalPages, page } = result;

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Books</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="books-table"
          action="/dashboard/admin/books"
          placeholder="Filter books..."
        />

        <Link href="/dashboard/admin/books/new">
          <Button variant="solid" color="primary">
            New Book
          </Button>
        </Link>
      </div>
      <AdminBooksTableAndFilter
        books={books}
        user={user}
        totalPages={totalPages}
        page={page}
        currentPath={currentPath}
      />
    </div>
  );
};

export default AdminBooksTable;
