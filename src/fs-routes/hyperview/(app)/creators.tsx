import { createRoute } from "hono-fsr";
import { filterPublishedCreators } from "../../../features/app/services";
import { AppLayout, SHELL_SCROLL_ID } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { Behavior, Spinner, Style, Text, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import CreatorsTabs, {
  creatorsTabStyles,
} from "../../../features/hyperview/components/CreatorsTabs";
import CreatorsList, {
  creatorsListStyles,
} from "../../../features/hyperview/components/CreatorsList";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles";
import { signInPromptStyles } from "../../../features/hyperview/components/SignInPrompt";
import CreatorsFilterForm, {
  CREATORS_SEARCH_BAR_ID,
  CREATORS_TAB_TARGET_ID,
  creatorsFilterFormStyles,
} from "../../../features/hyperview/components/CreatorsFilterForm";
import { CreatorCardResult } from "../../../constants/queries";

const DEFAULT_CREATORS_TAB = "all";

const defaultTabHref = (baseUrl: string) =>
  `${baseUrl}/hyperview/creators/tab/${DEFAULT_CREATORS_TAB}`;

const renderDefaultTabArea = (baseUrl: string) => (
  <View id={CREATORS_TAB_TARGET_ID} style="page-content">
    <Behavior
      trigger="load"
      verb="get"
      action="replace-inner"
      target={CREATORS_TAB_TARGET_ID}
      href={defaultTabHref(baseUrl)}
      hide-during-load="tab-area"
      show-during-load="tab-spinner"
    />
  </View>
);

const renderCreatorsTabArea = (
  baseUrl: string,
  creators: CreatorCardResult[],
  filtering: boolean,
) => (
  <View
    id={CREATORS_TAB_TARGET_ID}
    xmlns="https://hyperview.org/hyperview"
    style="page-content"
  >
    <view style="tab-fragment">
      {filtering && creators.length === 0 ? (
        <Text style="featured-empty-hint">No creators found.</Text>
      ) : (
        <CreatorsList
          creators={creators}
          baseUrl={baseUrl}
          page={1}
          hasMore={false}
        />
      )}
    </view>
  </View>
);

export const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);

  return hv(
    <AppLayout
      isSearch
      showDock
      title="Creators"
      user={user}
      baseUrl={baseUrl}
      dockActive="creators"
      extraStyles={pageStyles()}
      searchToggleTarget={CREATORS_SEARCH_BAR_ID}
      searchScrollToTopTarget={SHELL_SCROLL_ID}
      dockScrollRefreshHref={`${baseUrl}/hyperview/creators`}
    >
      <CreatorsTabs baseUrl={baseUrl} activeTab={DEFAULT_CREATORS_TAB} />
      <View
        id={CREATORS_SEARCH_BAR_ID}
        style="creators-search-bar"
        hide="true"
        sticky="true"
      >
        <CreatorsFilterForm baseUrl={baseUrl} />
      </View>
      <View id="tab-spinner" style="creators-tab-spinner" hide="true">
        <Spinner />
      </View>
      {renderDefaultTabArea(baseUrl)}
    </AppLayout>,
  );
});

export const POST = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const q = String((await c.req.formData()).get("q") ?? "").trim();
  const filtering = q.length > 0;

  if (!filtering) {
    return hv(
      <View
        id={CREATORS_TAB_TARGET_ID}
        xmlns="https://hyperview.org/hyperview"
        style="page-content"
      >
        <Behavior
          trigger="load"
          verb="get"
          action="replace-inner"
          target={CREATORS_TAB_TARGET_ID}
          href={defaultTabHref(baseUrl)}
          hide-during-load="tab-area"
          show-during-load="tab-spinner"
        />
      </View>,
    );
  }

  const [error, result] = await filterPublishedCreators(q, 50);

  if (error || !result) {
    return hv(
      <View
        id={CREATORS_TAB_TARGET_ID}
        xmlns="https://hyperview.org/hyperview"
        style="page-content"
      >
        <Text style="featured-empty-hint">Could not filter creators.</Text>
      </View>,
    );
  }

  const creators = result.creators ?? [];
  return hv(renderCreatorsTabArea(baseUrl, creators, filtering));
});

const pageStyles = () => (
  <>
    <Style id="tab-fragment" flex={1} />
    <Style
      id="creators-tab-spinner"
      flex={1}
      minHeight={240}
      alignItems="center"
      justifyContent="center"
      paddingTop={48}
    />
    {creatorsTabStyles()}
    {creatorsListStyles()}
    {creatorsFilterFormStyles()}
    {signInEmptyHintStyles()}
    {signInPromptStyles()}
  </>
);
