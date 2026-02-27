import { AuthUser } from "../../../../types";
import BookCard from "../../../components/app/BookCard";
import GridPanel from "../../../components/app/GridPanel";
import PageTitle from "../../../components/app/PageTitle";
import { Pagination } from "../../../components/app/Pagination";
import SortDropdown from "../../../components/app/SortDropdown";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import ErrorPage from "../../../pages/error/errorPage";
import { capitalize } from "../../../utils";
import BooksGrid from "../components/BooksGrid";
import { getBooksByTag } from "../services";

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

  return (
    <AppLayout title={`# ${capitalize(tag)}`} user={user}>
      <Page>
        <BooksGrid
          user={user}
          currentPath={currentPath}
          sortBy={sortBy}
          result={result}
        />
      </Page>
    </AppLayout>
  );
};
export default TagPage;
