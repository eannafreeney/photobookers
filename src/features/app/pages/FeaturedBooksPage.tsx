import { AuthUser, Flash } from "../../../../types";
import AppLayout from "../../../components/layouts/AppLayout";
import NavTabs from "../../../components/layouts/NavTabs";
import Page from "../../../components/layouts/Page";
import { getThisWeeksBookOfTheWeek } from "../BOTWServices";
import BookOfTheWeekGrid from "../components/BOTWGrid";
import DiscoveryTags from "../components/DiscoveryTags";
import Intersector from "../components/Intersector";

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
  const bookOfTheWeek = await getThisWeeksBookOfTheWeek();

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
        <Intersector
          id="creator-spotlights-fragment"
          endpoint="/fragments/creator-spotlights"
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
