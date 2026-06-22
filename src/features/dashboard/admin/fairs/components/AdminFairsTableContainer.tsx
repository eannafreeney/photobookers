import Button from "../../../../../components/app/Button";
import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import TableSearch from "../../../../../components/app/TableSearch";
import AdminFairsTableAndFilter from "./AdminFairsTableAndFilter";
import { AuthUser } from "../../../../../../types";

type Props = {
  currentPath: string;
  currentPage: number;
  searchQuery?: string;
  user: AuthUser | null;
};

const AdminFairsTableContainer = async ({
  currentPath,
  currentPage,
  searchQuery,
  user,
}: Props) => {
  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Book Fairs</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="fairs-table-container"
          action="/dashboard/admin/fairs"
          placeholder="Filter fairs..."
        />
        <Link href="/dashboard/admin/fairs/create">
          <Button variant="solid" color="primary">
            New Fair
          </Button>
        </Link>
      </div>
      <AdminFairsTableAndFilter
        user={user}
        currentPath={currentPath}
        currentPage={currentPage}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default AdminFairsTableContainer;
