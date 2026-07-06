import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paginationRequestBaseUrl } from "../../../../lib/pagination.js";
import { formValidator, paramValidator } from "../../../../lib/validator.js";
import { creatorIdSchema } from "../../../../schemas/index.js";
import { getUser } from "../../../../utils.js";
import CreatorImageForm from "../../../../features/dashboard/images/forms/CreatorCoverForm.js";
import {
  deleteCreatorByIdAdmin,
  getCreatorByIdAdmin,
  updateCreatorProfileAdmin
} from "../../../../features/dashboard/admin/creators/services.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import { creatorFormAdminSchema } from "../../../../features/dashboard/admin/creators/schemas.js";
import Alert from "../../../../components/app/Alert.js";
import CreatorFormAdmin from "../../../../features/dashboard/admin/creators/forms/AddCreatorFormAdmin.js";
import AdminCreatorsTableAndFilter from "../../../../features/dashboard/admin/creators/components/AdminCreatorsTableAndFilter.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import Breadcrumbs from "../../../../features/dashboard/admin/components/Breadcrumbs.js";
import EditCreatorFormAdmin from "../../../../features/dashboard/admin/creators/forms/EditCreatorFormAdmin.js";
import FeatureGuard from "../../../../components/layouts/FeatureGuard.js";
import { getFormValues } from "../../../../features/dashboard/creators/utils.js";
import CreatorBookList from "../../../../features/dashboard/admin/creators/components/CreatorBookList.js";
import StubOutreachStatus from "../../../../features/dashboard/admin/creators/components/StubOutreachStatus.js";
const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const user = await getUser(c);
  const creatorId = c.req.valid("param").creatorId;
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);
  const searchQuery = c.req.query("search");
  const [error, creator] = await getCreatorByIdAdmin(creatorId);
  if (error || !creator) return showErrorAlert(c, "Failed to get creator");
  const formValues = getFormValues(creator);
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Edit Creator Profile",
        user,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            Breadcrumbs,
            {
              items: [
                {
                  label: `Admin Creators Overview`,
                  href: "/dashboard/admin/creators"
                },
                {
                  label: `Edit ${creator.displayName}`
                }
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { class: "flex flex-col md:flex-row md:items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsx("div", { class: "md:w-1/3", children: /* @__PURE__ */ jsx(
              CreatorImageForm,
              {
                initialUrl: creator?.coverUrl ?? null,
                creator
              }
            ) }),
            /* @__PURE__ */ jsx(
              "div",
              {
                class: "hidden md:block w-px shrink-0 bg-outline self-stretch",
                "aria-hidden": "true"
              }
            ),
            /* @__PURE__ */ jsx("hr", { class: "my-4 md:hidden" }),
            /* @__PURE__ */ jsxs("div", { class: "md:w-2/3", children: [
              /* @__PURE__ */ jsx(
                EditCreatorFormAdmin,
                {
                  formValues,
                  creatorId: creator?.id,
                  type: creator?.type
                }
              ),
              /* @__PURE__ */ jsx("div", { class: "mt-4", children: /* @__PURE__ */ jsx(StubOutreachStatus, { creator }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            CreatorBookList,
            {
              creatorId: creator.id,
              currentPath,
              currentPage,
              searchQuery
            }
          ),
          /* @__PURE__ */ jsx(FeatureGuard, { flagName: "messages" })
        ] })
      }
    )
  );
});
const POST = createRoute(
  formValidator(creatorFormAdminSchema),
  paramValidator(creatorIdSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const creatorId = c.req.valid("param").creatorId;
    const updatedCreator = await updateCreatorProfileAdmin(formData, creatorId);
    if (!updatedCreator) {
      return showErrorAlert(c, "Failed to update creator");
    }
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Creator updated!" }),
        /* @__PURE__ */ jsx(CreatorFormAdmin, {})
      ] })
    );
  }
);
const DELETE = createRoute(
  paramValidator(creatorIdSchema),
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const currentPage = Number(c.req.query("page") ?? 1);
    const creatorsPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);
    const [error, deletedCreator] = await deleteCreatorByIdAdmin(creatorId);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Creator deleted!" }),
        /* @__PURE__ */ jsx(
          AdminCreatorsTableAndFilter,
          {
            searchQuery: void 0,
            currentPage,
            currentPath: creatorsPaginationBaseUrl
          }
        )
      ] })
    );
  }
);
export {
  DELETE,
  GET,
  POST
};
