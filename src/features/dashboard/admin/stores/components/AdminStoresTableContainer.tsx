import Button from "../../../../../components/app/Button";
import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import TableSearch from "../../../../../components/app/TableSearch";
import AdminStoresTableAndFilter from "./AdminStoresTableAndFilter";
import { AuthUser } from "../../../../../../types";

type Props = {
  currentPath: string;
  currentPage: number;
  searchQuery?: string;
  user: AuthUser | null;
};

const AdminStoresTableContainer = async ({
  currentPath,
  currentPage,
  searchQuery,
  user,
}: Props) => {
  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Bookstores</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="stores-table-container"
          action="/dashboard/admin/stores"
          placeholder="Filter stores..."
        />
        <Link href="/dashboard/admin/stores/create">
          <Button variant="solid" color="primary">
            New Store
          </Button>
        </Link>
      </div>
      <AdminStoresTableAndFilter
        user={user}
        currentPath={currentPath}
        currentPage={currentPage}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default AdminStoresTableContainer;
