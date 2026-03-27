import { AuthUser } from "../../../../types";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import BooksGrid from "../components/BooksGrid";
import { getLatestBooks } from "../services";

type Props = {
  user: AuthUser;
  currentPath: string;
  currentPage: number;
};

const BooksPage = async ({ user, currentPath, currentPage }: Props) => {
  const [error, result] = await getLatestBooks(currentPage, 30);

  if (error) return <></>;

  return (
    <AppLayout title="Books" user={user} currentPath={currentPath}>
      <Page>
        <BooksGrid
          title="Latest Books"
          user={user}
          currentPath={currentPath}
          result={result}
          isInfiniteScroll
        />
      </Page>
    </AppLayout>
  );
};

export default BooksPage;
