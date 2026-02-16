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

type TagPageProps = {
  user: AuthUser | null;
  tag: string;
  isMobile: boolean;
  currentPath: string;
  currentPage: number;
};

const TagPage = async ({
  user,
  tag,
  isMobile,
  currentPath,
  currentPage,
}: TagPageProps) => {
  const result = await getBooksByTag(tag, currentPage);

  if (!result?.books) {
    return <ErrorPage errorMessage="No featured books found" />;
  }

  const targetId = `books-grid-${tag}`;
  const { books, totalPages, page } = result;

  return (
    <AppLayout title={`# ${capitalize(tag)}`} user={user}>
      <Page>
        <PageTitle title={`# ${capitalize(tag)}`} isMobile={isMobile} />
        <GridPanel id={targetId} xMerge="append">
          {books.map((book) => (
            <BookCard book={book} user={user} />
          ))}
        </GridPanel>
        <Pagination
          baseUrl={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      </Page>
    </AppLayout>
  );
};
export default TagPage;
