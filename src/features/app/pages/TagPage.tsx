import { AuthUser } from "../../../../types";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import ErrorPage from "../../../pages/error/errorPage";
import { capitalize } from "../../../utils";
import BooksGrid from "../components/BooksGrid";
import Intersector from "../components/Intersector";
import RelatedBooks from "../components/RelatedBooks";
import { getBooksByTag } from "../services";

type TagPageProps = {
  user: AuthUser | null;
  tag: string;
  currentPath: string;
  currentPage: number;
};

const TagPage = async ({
  user,
  tag,
  currentPath,
  currentPage,
}: TagPageProps) => {
  const result = await getBooksByTag(tag, currentPage);

  if (!result?.books.length) {
    return <ErrorPage errorMessage="No books found for this tag" user={user} />;
  }

  return (
    <AppLayout
      title={`# ${capitalize(tag)}`}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <BooksGrid
          title={`# ${capitalize(tag)}`}
          user={user}
          currentPath={currentPath}
          result={result}
        />
        <Intersector
          id="related-books-fragment"
          endpoint={`/fragments/related-books/${result.books[0].slug}`}
        />
      </Page>
    </AppLayout>
  );
};
export default TagPage;
