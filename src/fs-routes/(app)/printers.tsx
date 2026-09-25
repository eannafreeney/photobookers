import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import PageHeader from "../../components/app/PageHeader";
import InfoPage from "../../pages/InfoPage";
import { getUser } from "../../utils";
import { canonicalUrl, pageTitle } from "../../lib/seo";
import { isFeatureEnabledForUser } from "../../lib/features";
import { getPublishedPrinters } from "../../features/app/printers/services";
import EntityColumns from "../../components/app/EntityColumns";
import GridMapViewSwitcher from "../../components/app/GridMapViewSwitcher";
import PrintersFilters from "../../features/app/printers/components/PrintersFilters";
import StoresMap from "../../features/app/stores/components/StoresMap";
import Button, { button } from "../../components/app/Button";
import Link from "@/components/app/Link";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  if (!isFeatureEnabledForUser("printers", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const [error, allPrinters] = await getPublishedPrinters();

  if (error) {
    return c.html(<InfoPage errorMessage={error.reason} user={user} />, 500);
  }

  const view = c.req.query("view") === "map" ? "map" : "grid";
  const query = c.req.query("query") || "";
  const city = c.req.query("city") || "";
  const country = c.req.query("country") || "";
  const countries = [
    ...new Set(allPrinters.map((printer) => printer.country)),
  ].sort();
  const needle = query.trim().toLowerCase();
  const printers = allPrinters.filter((printer) => {
    if (country && printer.country !== country) return false;
    if (city && !printer.city.toLowerCase().includes(city.toLowerCase())) {
      return false;
    }
    if (
      needle &&
      !`${printer.name} ${printer.city}`.toLowerCase().includes(needle)
    ) {
      return false;
    }
    return true;
  });

  const markers = printers.flatMap((printer) =>
    printer.latitude != null && printer.longitude != null
      ? [
          {
            slug: printer.slug,
            name: printer.name,
            city: printer.city,
            country: printer.country,
            latitude: printer.latitude,
            longitude: printer.longitude,
          },
        ]
      : [],
  );

  return c.html(
    <AppLayout
      title={pageTitle("Printers")}
      description="Photobook printers. Ask up to three for a quote."
      canonicalUrl={canonicalUrl(c.req.url, "/printers")}
      user={user}
      currentPath={c.req.path}
    >
      <Page>
        <PageHeader
          kicker="Make a book"
          title="Printers"
          intro="A short list of printers recommended by the community. Ask up to three for a quote. They reply to you directly."
        />
        <div class="flex items-center justify-between">
          <GridMapViewSwitcher
            currentView={view}
            basePath={currentPath}
            query={query}
            city={city}
            country={country}
          />
          {user && (
            <Link href="/printers/recommend" xTarget="modal-root">
              <Button color="primary" width="fit">
                Recommend a printer
              </Button>
            </Link>
          )}
        </div>
        <PrintersFilters
          query={query}
          city={city}
          countries={countries}
          country={country}
          baseUrl={currentPath}
          view={view}
        />
        {view === "map" ? (
          <StoresMap
            stores={markers}
            hrefBase="/printers"
            linkLabel="View printer"
            itemLabel="printer"
          />
        ) : (
          <EntityColumns
            entities={printers}
            hrefBase="/printers"
            emptyMessage="No printers yet."
          />
        )}
      </Page>
    </AppLayout>,
  );
});
