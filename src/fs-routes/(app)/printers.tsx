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
import PrintersFilters, {
  printerLanguages,
} from "../../features/app/printers/components/PrintersFilters";
import StoresMap from "../../features/app/stores/components/StoresMap";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  if (!isFeatureEnabledForUser("printers", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const [error, allPrinters] = await getPublishedPrinters();

  if (error) {
    return c.html(<InfoPage errorMessage={error.reason} user={user} />, 500);
  }

  const country = c.req.query("country") || "";
  const language = c.req.query("language") || "";
  const countries = [
    ...new Set(allPrinters.map((printer) => printer.country)),
  ].sort();
  const languages = [
    ...new Set(
      allPrinters.flatMap((printer) => printerLanguages(printer.languages)),
    ),
  ].sort();
  const printers = allPrinters.filter((printer) => {
    if (country && printer.country !== country) return false;
    if (
      language &&
      !printerLanguages(printer.languages).some(
        (item) => item.toLowerCase() === language.toLowerCase(),
      )
    ) {
      return false;
    }
    return true;
  });

  // const markers = printers.flatMap((printer) =>
  //   printer.latitude != null && printer.longitude != null
  //     ? [
  //         {
  //           slug: printer.slug,
  //           name: printer.name,
  //           city: printer.city,
  //           country: printer.country,
  //           latitude: printer.latitude,
  //           longitude: printer.longitude,
  //         },
  //       ]
  //     : [],
  // );

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
        <PrintersFilters
          countries={countries}
          languages={languages}
          country={country}
          language={language}
        />
        {/* <StoresMap
          stores={markers}
          hrefBase="/printers"
          linkLabel="View printer"
        /> */}
        <PrintersList printers={printers} />
      </Page>
    </AppLayout>,
  );
});
