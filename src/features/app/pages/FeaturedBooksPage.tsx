import { AuthUser, Flash } from "../../../../types";
import AppLayout from "../../../components/layouts/AppLayout";
import NavTabs from "../../../components/layouts/NavTabs";
import Page from "../../../components/layouts/Page";
import { getThisWeeksBookOfTheWeek } from "../BOTWServices";
import BooksGrid from "../components/BooksGrid";
import BookOfTheWeekGrid from "../components/BOTWGrid";
import CreatorSpotlightsGrid from "../components/CreatorSpotlightGrid";
import DiscoveryTags from "../components/DiscoveryTags";
import FeaturedBooksGrid from "../components/FeaturedBooksGrid";
import {
  getThisWeeksArtistOfTheWeek,
  getThisWeeksPublisherOfTheWeek,
} from "../CreatorSpotlightServices";
import { getThisWeeksFeaturedBooks } from "../FeaturedServices";
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
  const [
    result,
    bookOfTheWeek,
    featuredBooks,
    artistOfTheWeek,
    publisherOfTheWeek,
  ] = await Promise.all([
    getLatestBooks(currentPage, sortBy),
    getThisWeeksBookOfTheWeek(),
    getThisWeeksFeaturedBooks(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
  ]);

  return (
    <AppLayout title="Books" user={user} flash={flash}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <BookOfTheWeekGrid
          bookOfTheWeek={bookOfTheWeek}
          user={user}
          isMobile={isMobile}
        />
        <DiscoveryTags />
        <FeaturedBooksGrid featuredBooks={featuredBooks} user={user} />
        <CreatorSpotlightsGrid
          artistOfTheWeek={artistOfTheWeek}
          publisherOfTheWeek={publisherOfTheWeek}
        />
        <BooksGrid
          title="New & Notable"
          user={user}
          currentPath={currentPath}
          sortBy={sortBy}
          result={result}
          isFullWidth
        />
      </Page>
    </AppLayout>
  );
};

export default FeaturedBooksPage;
