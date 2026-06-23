import type { AnalyticsDateRange } from "../../book-analytics/dateRange";
import {
  getTopBooksByViews,
  type TopBooksByViewsScope,
} from "../../book-views/services";
import { findPurchaseClickCounts } from "../../purchase-clicks/services";
import TopBooksByViewsTable from "../admin/components/TopBooksByViewsTable";

type Props = {
  dateRange: AnalyticsDateRange | null;
  currentPath: string;
  currentPage: number;
  pageParam: string;
  scope?: TopBooksByViewsScope | null;
};

const TopBooksByViewsSection = async ({
  dateRange,
  currentPath,
  currentPage,
  pageParam,
  scope = null,
}: Props) => {
  const [error, result] = await getTopBooksByViews(
    dateRange,
    currentPage,
    10,
    scope,
  );
  if (error) return <div>{error.reason}</div>;

  const targetId = scope
    ? "creator-analytics-top-books-by-views"
    : "analytics-top-books-by-views";
  const { books, totalPages, page } = result;

  const clickCounts = await findPurchaseClickCounts(
    books.map((row) => row.bookId),
    dateRange,
  );

  return (
    <TopBooksByViewsTable
      currentPath={currentPath}
      pageParam={pageParam}
      books={books}
      totalPages={totalPages}
      page={page}
      targetId={targetId}
      clickCounts={clickCounts}
    />
  );
};

export default TopBooksByViewsSection;
