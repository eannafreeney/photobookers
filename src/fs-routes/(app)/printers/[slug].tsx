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
import {
  getPrinterBySlug,
  userCanNotePrinter,
} from "../../../features/app/printers/services";
import PrinterDetail from "../../../features/app/printers/components/PrinterDetail";

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

    let canNote = false;
    if (user && printer.status === "published") {
      const [noteError, access] = await userCanNotePrinter(user.id, printer.id);
      if (!noteError) canNote = access.canNote;
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
        <PrinterDetail printer={printer} canNote={canNote} />
      </AppLayout>,
    );
  },
);
