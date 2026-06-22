import FeaturedTabs, { featuredTabStyles } from "./FeaturedTabs";
import {
  FEATURED_TAB_BODY_ID,
  FEATURED_TAB_HOST_ID,
  FEATURED_TAB_SPINNER_ID,
} from "./featuredTabIds";
import { AppLayout } from "../../../fs-routes/hyperview/+layout";
import {
  messageListStyles,
  signInEmptyHintStyles,
} from "../hyperviewCommonScreenStyles";
import { Behavior, Spinner, Style, View } from "../../../lib/hxml-comps";
import { feedListStyles } from "./FeedList";
import { interviewsStyles } from "./Interviews";
import { trendingCreatorsStyles } from "./TrendingCreatorsSlider";
import { newsletterCardStyles } from "./NewsletterCard";
import { featuredHomeBodyStyles } from "./FeaturedHomeBody";
import { bookGridWithFiltersStyles } from "./BookGridWithFilters";
import { sectionHeaderStyles } from "./SectionHeader";
import { signInPromptStyles } from "./SignInPrompt";
import type { AuthUser } from "../../../../types";

type Props = {
  baseUrl: string;
  user: AuthUser | null;
  /** Clear Expo Supabase session after render (post-logout). */
  clearClientSession?: boolean;
};

const FeaturedScreen = ({ baseUrl, user, clearClientSession }: Props) => (
  <AppLayout
    title="Home"
    user={user}
    headerVariant="featured"
    showBackButton={false}
    showDock
    baseUrl={baseUrl}
    dockActive="home"
    dockScrollRefreshHref={`${baseUrl}/hyperview/featured`}
    extraStyles={pageStyles()}
  >
    {clearClientSession ? (
      <View hide="true">
        <Behavior trigger="load" action="sign-out-supabase" />
      </View>
    ) : null}
    <FeaturedTabs baseUrl={baseUrl} activeTab="home" />
    <View id={FEATURED_TAB_HOST_ID} style="featured-tab-panel">
      <View
        id={FEATURED_TAB_SPINNER_ID}
        style="featured-tab-spinner"
        hide="true"
      >
        <Spinner />
      </View>
      <View id={FEATURED_TAB_BODY_ID} style="featured-tab-body">
        <Behavior
          trigger="load"
          verb="get"
          action="replace-inner"
          target={FEATURED_TAB_BODY_ID}
          href={`${baseUrl}/hyperview/featured/tab/home-content`}
          hide-during-load={FEATURED_TAB_BODY_ID}
          show-during-load={FEATURED_TAB_SPINNER_ID}
        />
      </View>
    </View>
  </AppLayout>
);

export default FeaturedScreen;

const pageStyles = () => (
  <>
    <Style id="tab-fragment" flex={1} />
    {signInEmptyHintStyles()}
    {signInPromptStyles()}
    {featuredTabStyles()}
    {messageListStyles()}
    {feedListStyles()}
    {sectionHeaderStyles()}
    {interviewsStyles()}
    {trendingCreatorsStyles()}
    {newsletterCardStyles()}
    {featuredHomeBodyStyles()}
    {bookGridWithFiltersStyles()}
  </>
);
