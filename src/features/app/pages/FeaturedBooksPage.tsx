import { AuthUser, Flash } from "../../../../types";
import AppLayout from "../../../components/layouts/AppLayout";
import NavTabs from "../../../components/layouts/NavTabs";
import Page from "../../../components/layouts/Page";
import { loadingIcon } from "../../../lib/icons";
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
  const [bookOfTheWeek, artistOfTheWeek, publisherOfTheWeek] =
    await Promise.all([
      getThisWeeksBookOfTheWeek(),
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
        <Intersector
          id="featured-books-fragment"
          endpoint="/fragments/featured-books"
        />
        <CreatorSpotlightsGrid
          artistOfTheWeek={artistOfTheWeek}
          publisherOfTheWeek={publisherOfTheWeek}
        />
        <Intersector
          id="latest-books-fragment"
          endpoint="/fragments/latest-books"
        />
      </Page>
    </AppLayout>
  );
};

export default FeaturedBooksPage;

const Intersector = ({ id, endpoint }: { id: string; endpoint: string }) => (
  <div x-data id={id} x-intersect={`$ajax('${endpoint}', { target: '${id}' })`}>
    <div class="flex justify-center items-center">{loadingIcon}</div>
  </div>
);
