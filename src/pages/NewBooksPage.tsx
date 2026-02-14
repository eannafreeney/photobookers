import { AuthUser, Flash } from "../../types";
import BookCard from "../components/app/BookCard";
import GridPanel from "../components/app/GridPanel";
import { Pagination } from "../components/app/Pagination";
import AppLayout from "../components/layouts/AppLayout";
import NavTabs from "../components/layouts/NavTabs";
import Page from "../components/layouts/Page";
import { getNewBooks } from "../services/books";
import ErrorPage from "./error/errorPage";

type Props = {
  user: AuthUser | null;
  flash: Flash;
  currentPath: string;
  currentPage: number;
};

const NewBooksPage = async ({
  user,
  flash,
  currentPath,
  currentPage,
}: Props) => {
  const result = await getNewBooks(currentPage);

  if (!result?.books) {
    return <ErrorPage errorMessage="No featured books found" />;
  }

  const { books, totalPages, page } = result;

  const targetId = "new-books-grid";

  return (
    <AppLayout title="Books" user={user} flash={flash}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <GridPanel isFullWidth id={targetId}>
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

export default NewBooksPage;
