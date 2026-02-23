import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import NavTabs from "../../components/admin/NavTabs";
import BooksTable from "../../components/admin/BooksTable";
import { AuthUser, Flash } from "../../../types";
import ErrorPage from "../error/errorPage";
import { getAllBooksAdmin } from "../../services/admin";

type Props = {
  user: AuthUser;
  flash: Flash;
  searchQuery?: string;
  currentPage: number;
  currentPath: string;
};
const BooksPage = async ({
  user,
  flash,
  searchQuery,
  currentPage,
  currentPath,
}: Props) => {
  const result = await getAllBooksAdmin(currentPage, searchQuery);

  if (!result?.books) {
    return <ErrorPage errorMessage="No featured books found" />;
  }

  const { books, totalPages, page } = result;

  return (
    <AppLayout title="Books" user={user} flash={flash}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <BooksTable
          totalPages={totalPages}
          page={page}
          books={books}
          currentPath={currentPath}
        />
      </Page>
    </AppLayout>
  );
};

export default BooksPage;
