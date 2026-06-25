import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import { getUser } from "../../utils";
import Page from "../../components/layouts/Page";
import { isFeatureEnabledForUser } from "../../lib/features";
import InfoPage from "../../pages/InfoPage";
import {
  getPublishedStoreCountries,
  getPublishedStores,
  getPublishedStoresForMap,
} from "../../features/app/stores/services";
import StoresGrid from "../../features/app/stores/components/StoresGrid";
import StoresMap from "../../features/app/stores/components/StoresMap";
import StoresSearchForm from "../../features/app/stores/components/StoresSearchForm";
import StoresViewSwitcher from "../../features/app/stores/components/StoresViewSwitcher";
import { buildStoresViewUrl } from "../../features/app/stores/storeUrls";
import { pageTitle, canonicalUrl } from "../../lib/seo";
import SectionTitle from "../../components/app/SectionTitle";
import PageHeader from "../../components/app/PageHeader";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  if (!isFeatureEnabledForUser("stores", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const view = (c.req.query("view") ?? "grid") as "grid" | "map";
  const page = Number(c.req.query("page") ?? 1);
  const query = c.req.query("query") || "";
  const city = c.req.query("city") || "";
  const country = c.req.query("country") || "";

  const title = pageTitle("Bookstores");
  const description =
    "Discover photobook shops around the world. Find physical bookstores where you can browse and buy photobooks.";

  const [countriesError, countries] = await getPublishedStoreCountries();
  if (countriesError) {
    return c.html(
      <InfoPage errorMessage={countriesError.reason} user={user} />,
      500,
    );
  }

  const filterParams = {
    query: query || undefined,
    city: city || undefined,
    country: country || undefined,
  };

  let content;

  if (view === "map") {
    const [mapError, markers] = await getPublishedStoresForMap(filterParams);
    if (mapError) {
      return c.html(
        <InfoPage errorMessage={mapError.reason} user={user} />,
        500,
      );
    }

    content = (
      <>
        <ViewSwitcher
          currentView="map"
          basePath={currentPath}
          query={query}
          city={city}
          country={country}
        />
        <StoresSearchForm
          query={query}
          city={city}
          country={country}
          countries={countries}
          baseUrl={currentPath}
          view="map"
        />
        <StoresMap stores={markers} />
      </>
    );
  } else {
    const [error, result] = await getPublishedStores({
      page,
      ...filterParams,
    });

    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />, 500);
    }

    const { stores, totalPages } = result;
    const gridBaseUrl = buildStoresViewUrl(currentPath, {
      view: "grid",
      query,
      city,
      country,
    });

    const storesGrid = (
      <StoresGrid
        stores={stores}
        page={page}
        totalPages={totalPages}
        baseUrl={gridBaseUrl}
        targetId="stores-grid"
      />
    );

    content = (
      <>
        <ViewSwitcher
          currentView="grid"
          basePath={currentPath}
          query={query}
          city={city}
          country={country}
        />
        <StoresSearchForm
          query={query}
          city={city}
          country={country}
          countries={countries}
          baseUrl={currentPath}
          view="grid"
        />
        {storesGrid}
      </>
    );

    if (c.req.header("X-Requested-With") === "XMLHttpRequest") {
      return c.html(storesGrid);
    }
  }

  if (c.req.header("X-Requested-With") === "XMLHttpRequest") {
    return c.html(content);
  }

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/stores")}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <PageHeader
          kicker="Shop Local"
          title="Bookstores"
          intro="Discover photobook shops around the world. Find physical bookstores where you can browse and buy photobooks."
        />
        <div id="stores-content">{content}</div>
      </Page>
    </AppLayout>,
  );
});

type ViewSwitcherProps = {
  currentView: "grid" | "map";
  basePath: string;
  query: string;
  city: string;
  country: string;
};

const ViewSwitcher = ({
  currentView,
  basePath,
  query,
  city,
  country,
}: ViewSwitcherProps) => (
  <StoresViewSwitcher
    currentView={currentView}
    basePath={basePath}
    query={query}
    city={city}
    country={country}
  />
);
