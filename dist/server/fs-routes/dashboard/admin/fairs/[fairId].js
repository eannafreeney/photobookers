import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { fairIdSchema } from "../../../../features/dashboard/admin/fairs/schema.js";
import { formValidator, paramValidator } from "../../../../lib/validator.js";
import { getFlash, getUser } from "../../../../utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import Breadcrumbs from "../../../../features/dashboard/admin/components/Breadcrumbs.js";
import InfoPage from "../../../../pages/InfoPage.js";
import {
  deleteFairByIdAdmin,
  getFairByIdAdmin,
  updateFairAdmin,
  updateFairStatusAdmin
} from "../../../../features/dashboard/admin/fairs/services.js";
import FairFormAdmin from "../../../../features/dashboard/admin/fairs/forms/FairFormAdmin.js";
import { fairFormAdminSchema } from "../../../../features/dashboard/admin/fairs/schema.js";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers.js";
import Alert from "../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
import AttendeeManagerForm from "../../../../features/dashboard/admin/fairs/forms/AttendeeManagerForm.js";
import FairCoverForm from "../../../../features/dashboard/admin/fairs/forms/FairCoverForm.js";
import FairBannerForm from "../../../../features/dashboard/admin/fairs/forms/FairBannerForm.js";
import FairPublishToggle from "../../../../features/dashboard/admin/fairs/components/FairPublishToggle.js";
import FairPreviewButton from "../../../../features/dashboard/admin/fairs/components/FairPreviewButton.js";
import FairStatusBadge from "../../../../features/dashboard/admin/fairs/components/FairStatusBadge.js";
import { routeParam } from "../../../../lib/routeParam.js";
const GET = createRoute(
  paramValidator(fairIdSchema),
  async (c) => {
    const user = await getUser(c);
    const fairId = routeParam(c, "fairId");
    const flash = await getFlash(c);
    const currentPath = c.req.path;
    const [error, fair] = await getFairByIdAdmin(fairId);
    if (error)
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
    const formValues = {
      name: fair.name,
      slug: fair.slug,
      description: fair.description,
      city: fair.city,
      country: fair.country,
      venue: fair.venue,
      website: fair.website,
      start_date: new Date(fair.startDate).toISOString().split("T")[0],
      end_date: new Date(fair.endDate).toISOString().split("T")[0],
      status: fair.status,
      listing_tier: fair.listingTier,
      sort_order: fair.sortOrder
    };
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: `Edit Fair: ${fair.name}`,
          user,
          flash,
          currentPath,
          children: /* @__PURE__ */ jsxs(Page, { children: [
            /* @__PURE__ */ jsx(
              Breadcrumbs,
              {
                items: [
                  { label: "Admin Fairs Overview", href: "/dashboard/admin/fairs" },
                  {
                    label: `Edit "${fair.name}"`
                  }
                ]
              }
            ),
            /* @__PURE__ */ jsx(FairFormAdmin, { fairId: fair.id, formValues }),
            /* @__PURE__ */ jsx("hr", { class: "my-8" }),
            /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
              /* @__PURE__ */ jsx(FairCoverForm, { initialUrl: fair.coverUrl, fairId: fair.id }),
              /* @__PURE__ */ jsx(FairBannerForm, { initialUrl: fair.bannerUrl, fairId: fair.id })
            ] }),
            /* @__PURE__ */ jsx("hr", { class: "my-8" }),
            /* @__PURE__ */ jsx(AttendeeManagerForm, { fair, attendees: fair.attendees })
          ] })
        }
      )
    );
  }
);
const POST = createRoute(
  formValidator(fairFormAdminSchema),
  paramValidator(fairIdSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const fairId = c.req.valid("param").fairId;
    const updates = {
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
    const [error, updatedFair] = await updateFairAdmin(fairId, updates);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, `${updatedFair.name} updated!`);
  }
);
const PATCH = createRoute(
  paramValidator(fairIdSchema),
  async (c) => {
    const fairId = c.req.valid("param").fairId;
    const form = await c.req.parseBody();
    const intent = form.intent;
    if (intent !== "publish" && intent !== "unpublish") {
      return showErrorAlert(c, "Invalid intent");
    }
    const status = intent === "publish" ? "published" : "draft";
    const [error, updatedFair] = await updateFairStatusAdmin(fairId, status);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Alert,
          {
            type: status === "published" ? "success" : "warning",
            message: `${updatedFair.name} ${status === "published" ? "published" : "unpublished"}!`
          }
        ),
        /* @__PURE__ */ jsx(
          FairStatusBadge,
          {
            id: `fair-status-${updatedFair.id}`,
            status: updatedFair.status
          }
        ),
        /* @__PURE__ */ jsx(
          FairPublishToggle,
          {
            fairId: updatedFair.id,
            status: updatedFair.status
          }
        ),
        /* @__PURE__ */ jsx(
          FairPreviewButton,
          {
            fairId: updatedFair.id,
            slug: updatedFair.slug,
            status: updatedFair.status
          }
        )
      ] })
    );
  }
);
const DELETE = createRoute(
  paramValidator(fairIdSchema),
  async (c) => {
    const fairId = c.req.valid("param").fairId;
    const [error, deletedFair] = await deleteFairByIdAdmin(fairId);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: `${deletedFair.name} deleted!` }),
        dispatchEvents(["fairs:updated"])
      ] })
    );
  }
);
export {
  DELETE,
  GET,
  PATCH,
  POST
};
