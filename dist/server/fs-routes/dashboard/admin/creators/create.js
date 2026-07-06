import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paginationRequestBaseUrl } from "../../../../lib/pagination.js";
import { formValidator } from "../../../../lib/validator.js";
import { creatorFormAdminSchema } from "../../../../features/dashboard/admin/creators/schemas.js";
import { getUser } from "../../../../utils.js";
import { createStubCreatorProfileAdmin } from "../../../../features/dashboard/admin/creators/services.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import Alert from "../../../../components/app/Alert.js";
import AdminCreatorsTableAndFilter from "../../../../features/dashboard/admin/creators/components/AdminCreatorsTableAndFilter.js";
import CreatorFormAdmin from "../../../../features/dashboard/admin/creators/forms/AddCreatorFormAdmin.js";
const POST = createRoute(
  formValidator(creatorFormAdminSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");
    const currentPage = Number(c.req.query("page") ?? 1);
    const creatorsPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);
    const displayName = formData.displayName;
    const website = formData.website;
    const type = formData.type;
    const email = formData.email;
    const [error, newCreator] = await createStubCreatorProfileAdmin(
      displayName,
      user.id,
      type,
      website,
      email
    );
    if (error || !newCreator) {
      return showErrorAlert(
        c,
        "Failed to create stub creator profile. Please try again."
      );
    }
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Creator created!" }),
        /* @__PURE__ */ jsx(
          AdminCreatorsTableAndFilter,
          {
            searchQuery: void 0,
            currentPage,
            currentPath: creatorsPaginationBaseUrl
          }
        ),
        /* @__PURE__ */ jsx(CreatorFormAdmin, {})
      ] })
    );
  }
);
export {
  POST
};
