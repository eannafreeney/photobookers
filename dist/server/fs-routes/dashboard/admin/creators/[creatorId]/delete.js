import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { creatorIdSchema } from "../../../../../schemas/index.js";
import { deleteCreatorByIdAdmin } from "../../../../../features/dashboard/admin/creators/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import Alert from "../../../../../components/app/Alert.js";
import AdminCreatorsTableAndFilter from "../../../../../features/dashboard/admin/creators/components/AdminCreatorsTableAndFilter.js";
const POST = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const [error, deletedCreator] = await deleteCreatorByIdAdmin(creatorId);
  if (!error) {
    return showErrorAlert(c, "Failed to delete creator");
  }
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Creator deleted!" }),
      /* @__PURE__ */ jsx(
        AdminCreatorsTableAndFilter,
        {
          searchQuery: void 0,
          currentPage,
          currentPath
        }
      )
    ] })
  );
});
export {
  POST
};
