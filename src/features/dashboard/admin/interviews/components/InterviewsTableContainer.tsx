import SectionTitle from "../../../../../components/app/SectionTitle";
import TableSearch from "../../../../../components/app/TableSearch";
import InterviewsTableAndFilter from "./InterviewsTableAdmin";

type Props = {
  searchQuery?: string;
  currentPage: number;
  currentPath: string;
};

const InterviewsTableContainer = ({
  searchQuery,
  currentPage,
  currentPath,
}: Props) => {
  return (
    <div class="flex flex-col gap-8">
      <SectionTitle>Interviews</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="interviews-table-container"
          action="/dashboard/admin/interviews"
          placeholder="Filter interviews..."
        />
      </div>
      <InterviewsTableAndFilter
        currentPage={currentPage}
        searchQuery={searchQuery}
        currentPath={currentPath}
      />
    </div>
  );
};

export default InterviewsTableContainer;
