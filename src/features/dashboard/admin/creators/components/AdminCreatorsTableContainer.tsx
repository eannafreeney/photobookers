import SectionTitle from "../../../../../components/app/SectionTitle";
import TableSearch from "../../../../../components/app/TableSearch";
import AdminCreatorsTableAndFilter from "./AdminCreatorsTableAndFilter";

type Props = {
  searchQuery?: string;
  currentPage: number;
  currentPath: string;
};

const AdminCreatorsTableContainer = async ({
  searchQuery,
  currentPage,
  currentPath,
}: Props) => {
  return (
    <div class="flex flex-col gap-8">
      <SectionTitle>Creators</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="creators-table"
          action="/dashboard/admin/creators"
          placeholder="Filter creators..."
        />
      </div>
      <AdminCreatorsTableAndFilter
        currentPage={currentPage}
        searchQuery={searchQuery}
        currentPath={currentPath}
      />
    </div>
  );
};

export default AdminCreatorsTableContainer;
