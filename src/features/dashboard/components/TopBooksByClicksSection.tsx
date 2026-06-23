import type { AnalyticsDateRange } from "../../book-analytics/dateRange";
import {
  getTopBooksByClicks,
  type TopBooksByClicksScope,
} from "../../purchase-clicks/services";
import TopBooksByClickTable from "../admin/components/TopBooksByClickTable";

type Props = {
  dateRange: AnalyticsDateRange | null;
  currentPath: string;
  currentPage: number;
  pageParam: string;
  scope?: TopBooksByClicksScope | null;
};

const TopBooksByClicksSection = async ({
  dateRange,
  currentPath,
  currentPage,
  pageParam,
  scope = null,
}: Props) => {
  const [error, result] = await getTopBooksByClicks(
    dateRange,
    currentPage,
    10,
    scope,
  );
  if (error) return <div>{error.reason}</div>;

  const targetId = scope
    ? "creator-analytics-top-books-by-clicks"
    : "analytics-top-books";
  const { books, totalPages, page } = result;

  return (
    <TopBooksByClickTable
      currentPath={currentPath}
      pageParam={pageParam}
      books={books}
      totalPages={totalPages}
      page={page}
      targetId={targetId}
    />
  );
};

export default TopBooksByClicksSection;
