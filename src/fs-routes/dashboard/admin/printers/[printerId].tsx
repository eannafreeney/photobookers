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
  getPrinterByIdAdmin,
  updatePrinterAdmin,
} from "../../../../features/dashboard/admin/printers/services";
import { parseOptionalCoordinate } from "../../../../features/dashboard/admin/stores/coordinates";
import FormDelete from "../../../../components/forms/FormDelete";
import Button from "../../../../components/app/Button";
import FileUploadInput from "../../../../components/forms/FileUpload";

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
            <PrinterFormAdmin
              printerId={printer.id}
              formValues={{
                name: printer.name,
                slug: printer.slug,
                email: printer.email,
                description: printer.description,
                specialties: printer.specialties,
                city: printer.city,
                country: printer.country,
                website: printer.website,
                latitude: printer.latitude,
                longitude: printer.longitude,
                status: printer.status,
                sort_order: printer.sortOrder,
              }}
            />
            <section class="mt-10 flex flex-col gap-4">
              <h2 class="font-display text-2xl">Books they have printed</h2>
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
              <form
                method="post"
                action={`/dashboard/images/printers/${printer.id}/gallery`}
                enctype="multipart/form-data"
                class="flex flex-col gap-3 max-w-md"
              >
                <FileUploadInput
                  label="Add images"
                  name="images"
                  multiple
                  isVisible
                />
                <Button variant="solid" color="primary" width="fit">
                  Upload
                </Button>
              </form>
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
      slug: form.slug,
      email: form.email,
      description: form.description || null,
      specialties: form.specialties || null,
      city: form.city,
      country: form.country,
      website: form.website || null,
      latitude: parseOptionalCoordinate(form.latitude),
      longitude: parseOptionalCoordinate(form.longitude),
      status: form.status,
      sortOrder: form.sort_order ?? null,
    });
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Printer saved");
  },
);
