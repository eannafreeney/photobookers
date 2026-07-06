import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../../../utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import FairFormAdmin from "../../../../features/dashboard/admin/fairs/forms/FairFormAdmin.js";
import { formValidator } from "../../../../lib/validator.js";
import { fairFormAdminSchema } from "../../../../features/dashboard/admin/fairs/schema.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import { createFairAdmin } from "../../../../features/dashboard/admin/fairs/services.js";
import Alert from "../../../../components/app/Alert.js";
import Sidebar from "../../../../components/app/Sidebar.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Create Fair", user, currentPath, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: /* @__PURE__ */ jsx(FairFormAdmin, {}) }) }) })
  );
});
const POST = createRoute(
  formValidator(fairFormAdminSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");
    const fairData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      city: formData.city,
      country: formData.country,
      venue: formData.venue,
      website: formData.website || null,
      startDate: new Date(formData.start_date),
      endDate: new Date(formData.end_date),
      status: formData.status,
      listingTier: formData.listing_tier || "free",
      sortOrder: formData.sort_order || null
    };
    const [error, newFair] = await createFairAdmin(fairData, user.id);
    if (error) return showErrorAlert(c, error.reason);
    if (!newFair) {
      return c.html(
        /* @__PURE__ */ jsx(Alert, { type: "danger", message: "Failed to create fair" }),
        422
      );
    }
    await setFlash(c, "success", `${newFair.name} created!`);
    return c.redirect(`/dashboard/admin/fairs/${newFair.id}`, 303);
  }
);
export {
  GET,
  POST
};
