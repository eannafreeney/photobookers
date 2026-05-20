import { createRoute } from "hono-fsr";
import FeaturedHomeBody from "../../../features/hyperview/components/FeaturedHomeBody";
import FeaturedTabs from "../../../features/hyperview/components/FeaturedTabs";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { bookCardStyles } from "../../../features/hyperview/components/BookCard";
import { bookTabStyles } from "../../../features/hyperview/components/BookTabs";
import {
  messageListStyles,
  signInEmptyHintStyles,
} from "../../../features/hyperview/hyperviewCommonScreenStyles";
import { Spinner, Style, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { creatorCardStyles } from "../../../features/hyperview/components/CreatorCard";
import BooksUpdatedListener from "../../../features/hyperview/components/BooksUpdatedListener";

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
      <View id="tab-spinner-feed" style="tab-spinner-featured" hide="true">
        <Spinner />
      </View>
      <BooksUpdatedListener
        refreshHref={`${baseUrl}/hyperview/featured/tab/home-content`}
      />
      <View id="tab-area" style="page-content">
        <FeaturedHomeBody baseUrl={baseUrl} user={user} />
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style id="page-content" margin={16} />
    <Style id="tab-fragment" flex={1} />
    <Style
      id="tab-spinner-featured"
      minHeight={320}
      alignItems="center"
      justifyContent="center"
      paddingTop={48}
    />
    {signInEmptyHintStyles()}
    {messageListStyles()}
    {bookCardStyles()}
    {bookTabStyles()}
    {creatorCardStyles()}
  </>
);
