import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { creatorIdSchema } from "../../../../../schemas";
import { deleteCreatorByIdAdmin } from "../../../../../features/dashboard/admin/creators/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import AdminCreatorsTableAndFilter from "../../../../../features/dashboard/admin/creators/components/AdminCreatorsTableAndFilter";

export const POST = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const [error, deletedCreator] = await deleteCreatorByIdAdmin(creatorId);
  if (!error) {
    return showErrorAlert(c, "Failed to delete creator");
  }

  return c.html(
    <>
      <Alert type="success" message="Creator deleted!" />
      <AdminCreatorsTableAndFilter
        searchQuery={undefined}
        currentPage={currentPage}
        currentPath={currentPath}
      />
    </>,
  );
});
