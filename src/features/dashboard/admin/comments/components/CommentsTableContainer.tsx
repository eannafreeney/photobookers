import SectionTitle from "../../../../../components/app/SectionTitle";
import TableSearch from "../../../../../components/app/TableSearch";
import CommentsTableAdmin from "./CommentsTableAdmin";

type Props = {
  searchQuery?: string;
  currentPage: number;
  currentPath: string;
};

const CommentsTableContainer = ({
  searchQuery,
  currentPage,
  currentPath,
}: Props) => {
  return (
    <div class="flex flex-col gap-8">
      <SectionTitle>Comments</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="comments-table-container"
          action="/dashboard/admin/comments"
          placeholder="Filter by body, book, or user..."
        />
      </div>
      <CommentsTableAdmin
        currentPage={currentPage}
        searchQuery={searchQuery}
        currentPath={currentPath}
      />
    </div>
  );
};

export default CommentsTableContainer;
