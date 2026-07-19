import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { magazineMoveBookSchema } from "@/features/dashboard/admin/magazine/schema";
import { getIssueByIdForAdmin } from "@/domain/magazine/queries";
import { moveIssueBook } from "@/domain/magazine/mutations";
import { SelectedBooksList } from "@/features/dashboard/admin/magazine/components/SelectedBooks";
import Alert from "@/components/app/Alert";
import { showErrorAlert } from "@/lib/alertHelpers";

export const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineMoveBookSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const { bookId, direction } = c.req.valid("form");

    const [moveErr] = await moveIssueBook(id, bookId, direction);
    if (moveErr) return showErrorAlert(c, moveErr.reason);

    // Reload the issue so the re-rendered list reflects the new order.
    const [loadErr, issue] = await getIssueByIdForAdmin(id);
    if (loadErr || !issue) {
      return showErrorAlert(c, loadErr?.reason ?? "Issue not found");
    }

    const action = `/dashboard/admin/magazine/${id}`;
    return c.html(
      <>
        <SelectedBooksList issue={issue} action={action} />
        <Alert type="success" message="Order updated" />
      </>,
    );
  },
);
