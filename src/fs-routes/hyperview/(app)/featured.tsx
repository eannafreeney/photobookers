import { createRoute } from "hono-fsr";
import { getLatestBooks } from "../../../features/app/services";
import FeaturedHomeBody from "../../../features/hyperview/components/FeaturedHomeBody";
import FeaturedTabs from "../../../features/hyperview/components/FeaturedTabs";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { bookCardStyles } from "../../../features/hyperview/components/BookCard";
import { bookTabStyles } from "../../../features/hyperview/components/BookTabs";
import { heroCarouselStyles } from "../../../features/hyperview/components/HeroCarousel";
import { interviewsStyles } from "../../../features/hyperview/components/Interviews";
import { newsletterCardStyles } from "../../../features/hyperview/components/NewsletterCard";
import {
  messageListStyles,
  signInEmptyHintStyles,
} from "../../../features/hyperview/hyperviewCommonScreenStyles";
import { Style, View } from "../../../lib/hxml-comps";
import { sectionHeaderStyles } from "../../../features/hyperview/components/SectionHeader";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { likeFlagsForBooks } from "../../../features/hyperview/likeFlags";

export const GET = createRoute(async (c) => {
  const [error, result] = await getLatestBooks(1, 15);

  // if (error) return hxml(c, errorScreen("Failed to load books."));

  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const books = result?.books ?? [];
  const likesByBookId = await likeFlagsForBooks(user, books);

  const hv = hyperview(c);

  return hv(
    <AppLayout
      title="Home"
      headerVariant="featured"
      showBackButton={false}
      showDock
      baseUrl={baseUrl}
      dockActive="discover"
      extraStyles={pageStyles()}
    >
      <FeaturedTabs baseUrl={baseUrl} activeTab="home" />
      <View id="tab-area" style="page-content">
        <FeaturedHomeBody
          baseUrl={baseUrl}
          books={books}
          user={user}
          likesByBookId={likesByBookId}
        />
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style id="page-content" margin={16} />
    <Style id="tab-fragment" flex={1} />
    {signInEmptyHintStyles()}
    {messageListStyles()}
    {heroCarouselStyles()}
    {interviewsStyles()}
    {newsletterCardStyles()}
    {bookCardStyles()}
    {sectionHeaderStyles()}
    {bookTabStyles()}
  </>
);
