import { createRoute } from "hono-fsr";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { Style, Text, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { isFeatureEnabledForUser } from "../../../lib/features";
import { getPublishedStores } from "../../../features/app/stores/services";
import StoresList, {
  storesListStyles,
} from "../../../features/hyperview/components/StoresList";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen";

export const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);

  if (!isFeatureEnabledForUser("stores", user)) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message="Not found" />,
      404,
    );
  }

  const [error, result] = await getPublishedStores({ page: 1, limit: 30 });
  if (error || !result) {
    return hv(
      <ErrorScreen
        user={user}
        baseUrl={baseUrl}
        message={error?.reason ?? "Failed to get published stores"}
      />,
      500,
    );
  }

  return hv(
    <AppLayout
      showDock
      title="Bookstores"
      user={user}
      baseUrl={baseUrl}
      dockActive="home"
      extraStyles={pageStyles()}
      dockScrollRefreshHref={`${baseUrl}/hyperview/stores`}
    >
      <View style="page-content">
        {result.stores.length === 0 ? (
          <Text style="stores-empty-message">No bookstores found.</Text>
        ) : (
          <StoresList stores={result.stores} baseUrl={baseUrl} />
        )}
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style id="tab-fragment" flex={1} />
    {storesListStyles()}
    {signInEmptyHintStyles()}
  </>
);
