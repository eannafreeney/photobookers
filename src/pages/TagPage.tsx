import AppLayout from "../components/layouts/AppLayout";
import { Book } from "../db/schema";
import { AuthUser } from "../../types";
import { capitalize } from "../utils";
import PageTitle from "../components/app/PageTitle";
import GridPanel from "../components/app/GridPanel";
import BookCard from "../components/app/BookCard";
import Page from "../components/layouts/Page";
import NavTabs from "../components/layouts/NavTabs";
import { Pagination } from "../components/app/Pagination";
import { getBooksByTag } from "../services/books";
import ErrorPage from "./error/errorPage";
import SortDropdown from "../components/app/SortDropdown";

type TagPageProps = {
  user: AuthUser | null;
  tag: string;
  currentPath: string;
  currentPage: number;
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc";
};

const TagPage = async ({
  user,
  tag,
  currentPath,
  currentPage,
  sortBy,
}: TagPageProps) => {
  const result = await getBooksByTag(tag, currentPage, sortBy);

  if (!result?.books.length) {
    return <ErrorPage errorMessage="No books found for this tag" user={user} />;
  }

  const targetId = `books-grid-${tag}`;
  const { books, totalPages, page } = result;

  const baseUrlWithSort =
    sortBy !== "newest" ? `${currentPath}?sortBy=${sortBy}` : currentPath;

  return (
    <AppLayout title={`# ${capitalize(tag)}`} user={user}>
      <Page>
        <PageTitle title={`# ${capitalize(tag)}`} />
        <div class="flex justify-end">
          <SortDropdown sortBy={sortBy} currentPath={currentPath} />
        </div>
        <GridPanel id={targetId} xMerge="append" isFullWidth>
          {books.map((book) => (
            <BookCard book={book} user={user} />
          ))}
        </GridPanel>
        <Pagination
          baseUrl={baseUrlWithSort}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      </Page>
    </AppLayout>
  );
};
export default TagPage;
