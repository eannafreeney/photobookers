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
import PrintersList from "../../features/app/printers/components/PrintersList";
import StoresMap from "../../features/app/stores/components/StoresMap";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  if (!isFeatureEnabledForUser("printers", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const [error, printers] = await getPublishedPrinters();
  if (error) {
    return c.html(<InfoPage errorMessage={error.reason} user={user} />, 500);
  }

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
          intro="A short list of printers we trust. Ask up to three for a quote. They reply to you directly."
        />
        <StoresMap
          stores={markers}
          hrefBase="/printers"
          linkLabel="View printer"
        />
        <PrintersList printers={printers} />
      </Page>
    </AppLayout>,
  );
});
