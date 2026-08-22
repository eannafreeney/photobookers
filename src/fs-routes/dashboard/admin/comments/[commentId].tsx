import InfoPage from "../../../../pages/InfoPage";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../lib/validator";
import {
  addCommentFormSchema,
  commentIdSchema,
} from "../../../../features/api/schema";
import Sidebar from "../../../../components/app/Sidebar";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import { getUser } from "../../../../utils";
import EditCommentForm from "../../../../features/dashboard/admin/comments/forms/EditCommentForm";
import { getAdminCommentById } from "../../../../features/dashboard/admin/comments/services";
import {
  deleteCommentById,
  updateCommentById,
} from "../../../../features/app/services";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers";

export const GET = createRoute(paramValidator(commentIdSchema), async (c) => {
  const commentId = c.req.valid("param").commentId;

  const user = await getUser(c);
  const currentPath = c.req.path;

  const [error, comment] = await getAdminCommentById(commentId);
  if (error) return c.html(<InfoPage errorMessage={error.reason} />);
  if (!comment) return c.html(<InfoPage errorMessage="Comment not found" />);

  return c.html(
    <AppLayout title="Edit Comment" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <EditCommentForm comment={comment} />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(
  paramValidator(commentIdSchema),
  formValidator(addCommentFormSchema),
  async (c) => {
    const commentId = c.req.valid("param").commentId;
    const body = c.req.valid("form").body;
    const [error] = await updateCommentById(commentId, body);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Comment updated");
  },
);

export const DELETE = createRoute(
  paramValidator(commentIdSchema),
  async (c) => {
    const commentId = c.req.valid("param").commentId;
    const [error] = await deleteCommentById(commentId);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Comment deleted");
  },
);
