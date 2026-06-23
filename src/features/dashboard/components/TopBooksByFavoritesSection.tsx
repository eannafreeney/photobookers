import type { AnalyticsDateRange } from "../../book-analytics/dateRange";
import {
  getTopBooksByFavorites,
  type TopBooksByFavoritesScope,
} from "../../book-analytics/engagement";
import TopBooksByFavoritesTable from "../admin/components/TopBooksByFavoritesTable";

type Props = {
  dateRange: AnalyticsDateRange | null;
  currentPath: string;
  currentPage: number;
  pageParam: string;
  scope?: TopBooksByFavoritesScope | null;
};

const TopBooksByFavoritesSection = async ({
  dateRange,
  currentPath,
  currentPage,
  pageParam,
  scope = null,
}: Props) => {
  const [error, result] = await getTopBooksByFavorites(
    dateRange,
    currentPage,
    10,
    scope,
  );
  if (error) return <div>{error.reason}</div>;

  const targetId = scope
    ? "creator-analytics-top-books-by-favorites"
    : "analytics-top-books-by-favorites";
  const navId = scope
    ? "pagination-creator-top-books-by-favorites-table"
    : "pagination-top-books-by-favorites-table";
  const { books, totalPages, page } = result;

  return (
    <TopBooksByFavoritesTable
      currentPath={currentPath}
      pageParam={pageParam}
      books={books}
      totalPages={totalPages}
      page={page}
      targetId={targetId}
      navId={navId}
    />
  );
};

export default TopBooksByFavoritesSection;
