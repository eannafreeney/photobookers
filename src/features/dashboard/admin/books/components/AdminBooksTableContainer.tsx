import Button from "../../../../../components/app/Button";
import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import TableSearch from "../../../../../components/app/TableSearch";
import AdminBooksTableAndFilter from "./AdminBooksTableAndFilter";
import { AuthUser } from "../../../../../../types";

type Props = {
  currentPath: string;
  currentPage: number;
  searchQuery?: string;
  user: AuthUser | null;
  isMobile: boolean;
};

const AdminBooksTableContainer = async ({
  currentPath,
  currentPage,
  searchQuery,
  user,
  isMobile,
}: Props) => {
  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Books</SectionTitle>
      {!isMobile ? (
        <div class="flex items-center justify-between gap-4">
          <TableSearch
            target="books-table-container"
            action="/dashboard/admin/books"
            placeholder="Filter books..."
          />
          <Link href="/dashboard/admin/books/create">
            <Button variant="solid" color="primary">
              New Book
            </Button>
          </Link>
        </div>
      ) : null}
      <AdminBooksTableAndFilter
        user={user}
        currentPath={currentPath}
        currentPage={currentPage}
        searchQuery={searchQuery}
        isMobile={isMobile}
      />
    </div>
  );
};

export default AdminBooksTableContainer;
