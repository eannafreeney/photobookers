import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { AppLayout } from "../+layout.js";
import { hyperview } from "../../../lib/hxml.js";
import { Style, Text, View } from "../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getUser } from "../../../utils.js";
import { isFeatureEnabledForUser } from "../../../lib/features.js";
import { getPublishedStores } from "../../../features/app/stores/services.js";
import StoresList, {
  storesListStyles
} from "../../../features/hyperview/components/StoresList.js";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles.js";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen.js";
const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);
  if (!isFeatureEnabledForUser("stores", user)) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: "Not found" }),
      404
    );
  }
  const [error, result] = await getPublishedStores({ page: 1, limit: 30 });
  if (error || !result) {
    return hv(
      /* @__PURE__ */ jsx(
        ErrorScreen,
        {
          user,
          baseUrl,
          message: error?.reason ?? "Failed to get published stores"
        }
      ),
      500
    );
  }
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        showDock: true,
        title: "Bookstores",
        user,
        baseUrl,
        dockActive: "home",
        extraStyles: pageStyles(),
        dockScrollRefreshHref: `${baseUrl}/hyperview/stores`,
        children: /* @__PURE__ */ jsx(View, { style: "page-content", children: result.stores.length === 0 ? /* @__PURE__ */ jsx(Text, { style: "stores-empty-message", children: "No bookstores found." }) : /* @__PURE__ */ jsx(StoresList, { stores: result.stores, baseUrl }) })
      }
    )
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "tab-fragment", flex: 1 }),
  storesListStyles(),
  signInEmptyHintStyles()
] });
export {
  GET
};
