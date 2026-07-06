import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { storeIdSchema } from "../../../../features/dashboard/admin/stores/schema.js";
import { formValidator, paramValidator } from "../../../../lib/validator.js";
import { getFlash, getUser } from "../../../../utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import Breadcrumbs from "../../../../features/dashboard/admin/components/Breadcrumbs.js";
import InfoPage from "../../../../pages/InfoPage.js";
import {
  deleteStoreByIdAdmin,
  getStoreByIdAdmin,
  updateStoreAdmin
} from "../../../../features/dashboard/admin/stores/services.js";
import StoreFormAdmin from "../../../../features/dashboard/admin/stores/forms/StoreFormAdmin.js";
import { storeFormAdminSchema } from "../../../../features/dashboard/admin/stores/schema.js";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers.js";
import Alert from "../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
import StoreApprovalForm from "../../../../features/dashboard/admin/stores/forms/StoreApprovalForm.js";
import StoreCoverForm from "../../../../features/dashboard/admin/stores/forms/StoreCoverForm.js";
import { parseOptionalCoordinate } from "../../../../features/dashboard/admin/stores/coordinates.js";
import { routeParam } from "../../../../lib/routeParam.js";
const GET = createRoute(
  paramValidator(storeIdSchema),
  async (c) => {
    const user = await getUser(c);
    const storeId = routeParam(c, "storeId");
    const flash = await getFlash(c);
    const currentPath = c.req.path;
    const [error, store] = await getStoreByIdAdmin(storeId);
    if (error)
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
    const formValues = {
      name: store.name,
      slug: store.slug,
      description: store.description,
      address: store.address,
      city: store.city,
      country: store.country,
      website: store.website,
      latitude: store.latitude,
      longitude: store.longitude,
      status: store.status,
      sort_order: store.sortOrder
    };
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: `Edit Store: ${store.name}`,
          user,
          flash,
          currentPath,
          children: /* @__PURE__ */ jsxs(Page, { children: [
            /* @__PURE__ */ jsx(
              Breadcrumbs,
              {
                items: [
                  {
                    label: "Admin Stores Overview",
                    href: "/dashboard/admin/stores"
                  },
                  {
                    label: `Edit "${store.name}"`
                  }
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { class: "flex justify-end mb-4", children: /* @__PURE__ */ jsx(StoreApprovalForm, { store }) }),
            /* @__PURE__ */ jsx(StoreFormAdmin, { storeId: store.id, formValues }),
            /* @__PURE__ */ jsx("hr", { class: "my-8" }),
            /* @__PURE__ */ jsx(StoreCoverForm, { store })
          ] })
        }
      )
    );
  }
);
const POST = createRoute(
  formValidator(storeFormAdminSchema),
  paramValidator(storeIdSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const storeId = c.req.valid("param").storeId;
    const updates = {
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
    const [error, updatedStore] = await updateStoreAdmin(storeId, updates);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, `${updatedStore.name} updated!`);
  }
);
const DELETE = createRoute(
  paramValidator(storeIdSchema),
  async (c) => {
    const storeId = c.req.valid("param").storeId;
    const [error, deletedStore] = await deleteStoreByIdAdmin(storeId);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: `${deletedStore.name} deleted!` }),
        dispatchEvents(["stores:updated"])
      ] })
    );
  }
);
export {
  DELETE,
  GET,
  POST
};
