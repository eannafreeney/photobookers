import { createRoute } from "hono-fsr";
import FeaturedTabs, {
  featuredTabStyles,
} from "../../../features/hyperview/components/FeaturedTabs";
import {
  FEATURED_TAB_BODY_ID,
  FEATURED_TAB_HOST_ID,
  FEATURED_TAB_SPINNER_ID,
} from "../../../features/hyperview/components/featuredTabIds";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { bookCardStyles } from "../../../features/hyperview/components/BookCard";
import {
  messageListStyles,
  signInEmptyHintStyles,
} from "../../../features/hyperview/hyperviewCommonScreenStyles";
import { Behavior, Spinner, Style, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { creatorCardStyles } from "../../../features/hyperview/components/CreatorCard";
import { feedListStyles } from "../../../features/hyperview/components/FeedList";
import { signInPromptStyles } from "../../../features/hyperview/components/SignInPrompt";

export const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);

  return hv(
    <AppLayout
      title="Home"
      user={user}
      headerVariant="featured"
      showBackButton={false}
      showDock
      baseUrl={baseUrl}
      dockActive="home"
      extraStyles={pageStyles()}
    >
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
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style id="tab-fragment" flex={1} />
    {signInEmptyHintStyles()}
    {signInPromptStyles()}
    {featuredTabStyles()}
    {messageListStyles()}
    {bookCardStyles()}
    {creatorCardStyles()}
    {feedListStyles()}
  </>
);
