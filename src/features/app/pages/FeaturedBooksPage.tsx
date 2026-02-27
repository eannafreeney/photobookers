import { AuthUser, Flash } from "../../../../types";
import AppLayout from "../../../components/layouts/AppLayout";
import FeatureGuard from "../../../components/layouts/FeatureGuard";
import NavTabs from "../../../components/layouts/NavTabs";
import Page from "../../../components/layouts/Page";
import BooksGrid from "../components/BooksGrid";
import BookOfTheWeekGrid from "../components/BOTWGrid";
import DiscoveryTags from "../components/DiscoveryTags";
import { getLatestBooks } from "../services";

type Props = {
  user: AuthUser | null;
  flash: Flash;
  currentPath: string;
  currentPage: number;
  isMobile: boolean;
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc";
};

const FeaturedBooksPage = async ({
  user,
  flash,
  currentPath,
  currentPage,
  isMobile,
  sortBy,
}: Props) => {
  const result = await getLatestBooks(currentPage, 10);

  return (
    <AppLayout title="Books" user={user} flash={flash}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <BookOfTheWeekGrid user={user} isMobile={isMobile} />
        <FeatureGuard flagName="featured-books">
          {/* <SectionTitle>New & Notable</SectionTitle>
          <GridPanel isFullWidth>
            {books.map((book) => (
              <BookCard book={book} user={user} showHeader />
            ))}
          </GridPanel> */}
        </FeatureGuard>
        <DiscoveryTags />
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

export default FeaturedBooksPage;
