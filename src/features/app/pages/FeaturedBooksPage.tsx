import { AuthUser, Flash } from "../../../../types";
import AppLayout from "../../../components/layouts/AppLayout";
import NavTabs from "../../../components/layouts/NavTabs";
import Page from "../../../components/layouts/Page";
import { getThisWeeksBookOfTheWeek } from "../BOTWServices";
import BookGridSkeleton from "../components/BookGridSkeleton.";
import BookOfTheWeekGrid from "../components/BOTWGrid";
import CreatorSpotlightsGrid from "../components/CreatorSpotlightGrid";
import DiscoveryTags from "../components/DiscoveryTags";
import Intersector from "../components/Intersector";
import {
  getThisWeeksArtistOfTheWeek,
  getThisWeeksPublisherOfTheWeek,
} from "../CreatorSpotlightServices";

type Props = {
  user: AuthUser | null;
  flash: Flash;
  currentPath: string;
  isMobile: boolean;
};

const FeaturedBooksPage = async ({
  user,
  flash,
  currentPath,
  isMobile,
}: Props) => {
  const [bookOfTheWeek, artistOfTheWeek, publisherOfTheWeek] =
    await Promise.all([
      getThisWeeksBookOfTheWeek(),
      getThisWeeksArtistOfTheWeek(),
      getThisWeeksPublisherOfTheWeek(),
    ]);

  return (
    <AppLayout
      title="Books"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
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
