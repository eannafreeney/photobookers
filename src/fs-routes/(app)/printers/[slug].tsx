import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { paramValidator } from "../../../lib/validator";
import { slugSchema } from "../../../features/app/schema";
import { routeParam } from "../../../lib/routeParam";
import AppLayout from "../../../components/layouts/AppLayout";
import { getFlash, getUser } from "../../../utils";
import InfoPage from "../../../pages/InfoPage";
import { canonicalUrl, pageTitle, truncateDescription } from "../../../lib/seo";
import { isFeatureEnabledForUser } from "../../../lib/features";
import { getPrinterBySlug } from "../../../features/app/printers/services";
import PrinterDetail from "../../../features/app/printers/components/PrinterDetail";
import Page from "@/components/layouts/Page";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const user = await getUser(c);
    if (!isFeatureEnabledForUser("printers", user)) {
      return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
    }

    const slug = routeParam(c, "slug");
    const [error, printer] = await getPrinterBySlug(slug);
    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />, 404);
    }

    if (printer.status !== "published" && !user?.isAdmin) {
      return c.html(
        <InfoPage errorMessage="Printer not found" user={user} />,
        404,
      );
    }

    const flash = await getFlash(c);
    const description = truncateDescription(
      printer.description ??
        `${printer.name} — photobook printer in ${printer.city}, ${printer.country}`,
    );

    return c.html(
      <AppLayout
        title={pageTitle(printer.name)}
        description={description}
        canonicalUrl={canonicalUrl(c.req.url, `/printers/${printer.slug}`)}
        user={user}
        currentPath={c.req.path}
        flash={flash}
      >
        <Page>
          <PrinterDetail printer={printer} />
        </Page>
      </AppLayout>,
    );
  },
);
