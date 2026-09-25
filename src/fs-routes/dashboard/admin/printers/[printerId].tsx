import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Sidebar from "../../../../components/app/Sidebar";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { getUser } from "../../../../utils";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers";
import InfoPage from "../../../../pages/InfoPage";
import { routeParam } from "../../../../lib/routeParam";
import {
  printerFormAdminSchema,
  printerIdSchema,
} from "../../../../features/dashboard/admin/printers/schema";
import PrinterFormAdmin from "../../../../features/dashboard/admin/printers/forms/PrinterFormAdmin";
import {
  deletePrinterAdmin,
  generateUniquePrinterSlug,
  getPrinterByIdAdmin,
  updatePrinterAdmin,
} from "../../../../features/dashboard/admin/printers/services";
import { parseOptionalCoordinate } from "../../../../features/dashboard/admin/stores/coordinates";
import FormDelete from "../../../../components/forms/FormDelete";
import Button from "../../../../components/app/Button";
import PrinterGalleryForm from "../../../../features/dashboard/admin/printers/forms/PrinterGalleryForm";
import PrinterImageForm from "../../../../features/dashboard/admin/printers/forms/PrinterImageForm";
import PrinterPublishToggle from "../../../../features/dashboard/admin/printers/components/PrinterPublishToggle";
import PrinterBookSearch, {
  PrinterBooksList,
} from "../../../../features/dashboard/admin/printers/components/PrinterBooks";
import Alert from "../../../../components/app/Alert";
import Breadcrumbs from "../../../../features/dashboard/admin/components/Breadcrumbs";

export const GET = createRoute(
  paramValidator(printerIdSchema),
  async (c: Context) => {
    const user = await getUser(c);
    const printerId = routeParam(c, "printerId");
    const [error, printer] = await getPrinterByIdAdmin(printerId);
    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);
    }

    return c.html(
      <AppLayout
        title={`Edit ${printer.name}`}
        user={user}
        currentPath={c.req.path}
      >
        <Page>
          <Sidebar currentPath="/dashboard/admin/printers">
            <div class="mb-6">
              <Breadcrumbs
                items={[
                  {
                    label: "Admin Printers Overview",
                    href: "/dashboard/admin/printers",
                  },
                  { label: `Edit "${printer.name}"` },
                ]}
              />
            </div>
            <PrinterFormAdmin
              printerId={printer.id}
              status={printer.status}
              formValues={{
                name: printer.name,
                email: printer.email,
                description: printer.description,
                city: printer.city,
                country: printer.country,
                website: printer.website,
                latitude: printer.latitude,
                longitude: printer.longitude,
              }}
            />
            <section class="mt-10 flex flex-col gap-4">
              <h2 class="font-display text-2xl">Cover</h2>
              <PrinterImageForm
                printerId={printer.id}
                imageUrl={printer.coverUrl}
                kind="cover"
              />
            </section>
            <section class="mt-10 flex flex-col gap-4">
              <h2 class="font-display text-2xl">Banner</h2>
              <PrinterImageForm
                printerId={printer.id}
                imageUrl={printer.bannerUrl}
                kind="banner"
              />
            </section>
            <section class="mt-10 flex flex-col gap-4">
              <h2 class="font-display text-2xl">Gallery</h2>
              <ul class="grid grid-cols-2 gap-3 md:grid-cols-4">
                {printer.images.map((image) => (
                  <li class="flex flex-col gap-2">
                    <img
                      src={image.imageUrl}
                      alt=""
                      class="aspect-[3/4] w-full object-cover border border-outline"
                    />
                    <FormDelete
                      action={`/dashboard/images/printers/${printer.id}/gallery?imageId=${image.id}`}
                    >
                      <Button variant="outline" color="danger" width="full">
                        Remove
                      </Button>
                    </FormDelete>
                  </li>
                ))}
              </ul>
              <PrinterGalleryForm printerId={printer.id} />
            </section>
            <section class="mt-10 flex flex-col gap-4">
              <h2 class="font-display text-2xl">Books printed here</h2>
              <PrinterBookSearch printerId={printer.id} />
              <PrinterBooksList
                printerId={printer.id}
                books={printer.printedBooks}
              />
            </section>
          </Sidebar>
        </Page>
      </AppLayout>,
    );
  },
);

export const POST = createRoute(
  paramValidator(printerIdSchema),
  formValidator(printerFormAdminSchema),
  async (c) => {
    const printerId = c.req.valid("param").printerId;
    const form = c.req.valid("form");
    const [error] = await updatePrinterAdmin(printerId, {
      name: form.name,
      slug: await generateUniquePrinterSlug(form.name, printerId),
      email: form.email,
      description: form.description || null,
      city: form.city,
      country: form.country,
      website: form.website || null,
      latitude: parseOptionalCoordinate(form.latitude),
      longitude: parseOptionalCoordinate(form.longitude),
    });
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Printer saved");
  },
);

export const PATCH = createRoute(paramValidator(printerIdSchema), async (c) => {
  const printerId = c.req.valid("param").printerId;
  const form = await c.req.parseBody();
  const intent = form.intent;

  if (intent !== "publish" && intent !== "unpublish") {
    return showErrorAlert(c, "Invalid intent");
  }

  const status = intent === "publish" ? "published" : "draft";
  const [error, printer] = await updatePrinterAdmin(printerId, { status });
  if (error) return showErrorAlert(c, error.reason);

  return c.html(
    <>
      <Alert
        type={status === "published" ? "success" : "warning"}
        message={`${printer.name} ${status === "published" ? "published" : "unpublished"}`}
      />
      <PrinterPublishToggle printerId={printer.id} status={printer.status} />
    </>,
  );
});

export const DELETE = createRoute(
  paramValidator(printerIdSchema),
  async (c) => {
    const printerId = c.req.valid("param").printerId;
    const [error, printer] = await deletePrinterAdmin(printerId);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, `${printer.name} deleted`);
  },
);
