import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../components/layouts/AppLayout.js";
import { getUser } from "../../utils.js";
import Page from "../../components/layouts/Page.js";
import { isFeatureEnabledForUser } from "../../lib/features.js";
import InfoPage from "../../pages/InfoPage.js";
import {
  getPublishedStoreCountries,
  getPublishedStores,
  getPublishedStoresForMap
} from "../../features/app/stores/services.js";
import StoresGrid from "../../features/app/stores/components/StoresGrid.js";
import StoresMap from "../../features/app/stores/components/StoresMap.js";
import StoresSearchForm from "../../features/app/stores/components/StoresSearchForm.js";
import StoresViewSwitcher from "../../features/app/stores/components/StoresViewSwitcher.js";
import { buildStoresViewUrl } from "../../features/app/stores/storeUrls.js";
import { pageTitle, canonicalUrl } from "../../lib/seo.js";
import PageHeader from "../../components/app/PageHeader.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  if (!isFeatureEnabledForUser("stores", user)) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const view = c.req.query("view") ?? "grid";
  const page = Number(c.req.query("page") ?? 1);
  const query = c.req.query("query") || "";
  const city = c.req.query("city") || "";
  const country = c.req.query("country") || "";
  const title = pageTitle("Bookstores");
  const description = "Discover photobook shops around the world. Find physical bookstores where you can browse and buy photobooks.";
  const [countriesError, countries] = await getPublishedStoreCountries();
  if (countriesError) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: countriesError.reason, user }),
      500
    );
  }
  const filterParams = {
    query: query || void 0,
    city: city || void 0,
    country: country || void 0
  };
  let content;
  if (view === "map") {
    const [mapError, markers] = await getPublishedStoresForMap(filterParams);
    if (mapError) {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: mapError.reason, user }),
        500
      );
    }
    content = /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        ViewSwitcher,
        {
          currentView: "map",
          basePath: currentPath,
          query,
          city,
          country
        }
      ),
      /* @__PURE__ */ jsx(
        StoresSearchForm,
        {
          query,
          city,
          country,
          countries,
          baseUrl: currentPath,
          view: "map"
        }
      ),
      /* @__PURE__ */ jsx(StoresMap, { stores: markers })
    ] });
  } else {
    const [error, result] = await getPublishedStores({
      page,
      ...filterParams
    });
    if (error) {
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }), 500);
    }
    const { stores, totalPages } = result;
    const gridBaseUrl = buildStoresViewUrl(currentPath, {
      view: "grid",
      query,
      city,
      country
    });
    const storesGrid = /* @__PURE__ */ jsx(
      StoresGrid,
      {
        stores,
        page,
        totalPages,
        baseUrl: gridBaseUrl,
        targetId: "stores-grid"
      }
    );
    content = /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        ViewSwitcher,
        {
          currentView: "grid",
          basePath: currentPath,
          query,
          city,
          country
        }
      ),
      /* @__PURE__ */ jsx(
        StoresSearchForm,
        {
          query,
          city,
          country,
          countries,
          baseUrl: currentPath,
          view: "grid"
        }
      ),
      storesGrid
    ] });
    if (c.req.header("X-Requested-With") === "XMLHttpRequest") {
      return c.html(storesGrid);
    }
  }
  if (c.req.header("X-Requested-With") === "XMLHttpRequest") {
    return c.html(content);
  }
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/stores"),
        user,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "Shop Local",
              title: "Bookstores",
              intro: "Discover photobook shops around the world. Find physical bookstores where you can browse and buy photobooks."
            }
          ),
          /* @__PURE__ */ jsx("div", { id: "stores-content", children: content })
        ] })
      }
    )
  );
});
const ViewSwitcher = ({
  currentView,
  basePath,
  query,
  city,
  country
}) => /* @__PURE__ */ jsx(
  StoresViewSwitcher,
  {
    currentView,
    basePath,
    query,
    city,
    country
  }
);
export {
  GET
};
