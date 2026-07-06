import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../../../utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import StoreFormAdmin from "../../../../features/dashboard/admin/stores/forms/StoreFormAdmin.js";
import { formValidator } from "../../../../lib/validator.js";
import { storeFormAdminSchema } from "../../../../features/dashboard/admin/stores/schema.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import { createStoreAdmin } from "../../../../features/dashboard/admin/stores/services.js";
import { parseOptionalCoordinate } from "../../../../features/dashboard/admin/stores/coordinates.js";
import Alert from "../../../../components/app/Alert.js";
import Sidebar from "../../../../components/app/Sidebar.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Create Store", user, currentPath, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: /* @__PURE__ */ jsx(StoreFormAdmin, {}) }) }) })
  );
});
const POST = createRoute(
  formValidator(storeFormAdminSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");
    const storeData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      website: formData.website || null,
      latitude: parseOptionalCoordinate(formData.latitude),
      longitude: parseOptionalCoordinate(formData.longitude),
      status: formData.status,
      sortOrder: formData.sort_order || null
    };
    const [error, newStore] = await createStoreAdmin(storeData, user.id);
    if (error) return showErrorAlert(c, error.reason);
    if (!newStore) {
      return c.html(
        /* @__PURE__ */ jsx(Alert, { type: "danger", message: "Failed to create store" }),
        422
      );
    }
    await setFlash(c, "success", `${newStore.name} created!`);
    return c.redirect(`/dashboard/admin/stores/${newStore.id}`, 303);
  }
);
export {
  GET,
  POST
};
