import { createRoute } from "hono-fsr";
import { z } from "zod";
import { paramValidator } from "../../../../lib/validator";
import { AppLayout } from "../../+layout";
import { hyperview } from "../../../../lib/hxml";
import { Style, View } from "../../../../lib/hxml-comps";
import { getBaseUrl } from "../../../../lib/hyperview";
import { getUser } from "../../../../utils";
import { isFeatureEnabledForUser } from "../../../../lib/features";
import { getStoreBySlug } from "../../../../features/app/stores/services";
import StoreDetailBody, {
  storeDetailBodyStyles,
} from "../../../../features/hyperview/components/StoreDetailBody";
import ErrorScreen from "../../../../features/hyperview/components/ErrorScreen";

const slugSchema = z.object({
  slug: z.string(),
});

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);

  if (!isFeatureEnabledForUser("stores", user)) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message="Not found" />,
      404,
    );
  }

  const [error, store] = await getStoreBySlug(slug);
  if (error) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message={error.reason} />,
      404,
    );
  }

  const isPublished =
    store.status === "published" && store.approvalStatus === "approved";

  if (!isPublished && !user?.isAdmin) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message="Store not found" />,
      404,
    );
  }

  return hv(
    <AppLayout
      title={store.name}
      user={user}
      baseUrl={baseUrl}
      fixedHeader
      extraStyles={pageStyles()}
    >
      <View style="page-content">
        <StoreDetailBody store={store} />
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style id="tab-fragment" flex={1} />
    {storeDetailBodyStyles()}
  </>
);
