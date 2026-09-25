import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Sidebar from "../../../../components/app/Sidebar";
import { formValidator } from "../../../../lib/validator";
import { getUser } from "../../../../utils";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { printerFormAdminSchema } from "../../../../features/dashboard/admin/printers/schema";
import PrinterFormAdmin from "../../../../features/dashboard/admin/printers/forms/PrinterFormAdmin";
import {
  createPrinterAdmin,
  generateUniquePrinterSlug,
} from "../../../../features/dashboard/admin/printers/services";
import { parseOptionalCoordinate } from "../../../../features/dashboard/admin/stores/coordinates";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  return c.html(
    <AppLayout title="Create printer" user={user} currentPath={c.req.path}>
      <Page>
        <Sidebar currentPath={c.req.path}>
          <PrinterFormAdmin />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(
  formValidator(printerFormAdminSchema),
  async (c) => {
    const form = c.req.valid("form");
    const [error, printer] = await createPrinterAdmin({
      name: form.name,
      slug: await generateUniquePrinterSlug(form.name),
      email: form.email,
      description: form.description || null,
      city: form.city,
      country: form.country,
      website: form.website || null,
      latitude: parseOptionalCoordinate(form.latitude),
      longitude: parseOptionalCoordinate(form.longitude),
      status: "draft",
    });

    if (error || !printer) return showErrorAlert(c, error?.reason);

    return c.redirect(`/dashboard/admin/printers/${printer.id}`, 303);
  },
);
