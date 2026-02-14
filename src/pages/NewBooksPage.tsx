import { AuthUser, Flash } from "../../types";
import BookCard from "../components/app/BookCard";
import GridPanel from "../components/app/GridPanel";
import AppLayout from "../components/layouts/AppLayout";
import NavTabs from "../components/layouts/NavTabs";
import Page from "../components/layouts/Page";
import { getNewBooks } from "../services/books";
import ErrorPage from "./error/errorPage";

type Props = {
  user: AuthUser | null;
  flash: Flash;
  currentPath: string;
};

const NewBooksPage = async ({ user, flash, currentPath }: Props) => {
  const featuredBooks = await getNewBooks();

  if (!featuredBooks) {
    return <ErrorPage errorMessage="No featured books found" />;
  }

  return (
    <AppLayout title="Books" user={user} flash={flash}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <GridPanel isFullWidth>
          {featuredBooks.map((book) => (
            <BookCard book={book} user={user} />
          ))}
        </GridPanel>
      </Page>
    </AppLayout>
  );
};

export default NewBooksPage;
