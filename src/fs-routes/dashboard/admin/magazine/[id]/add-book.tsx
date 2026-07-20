import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { magazineBookActionSchema } from "@/features/dashboard/admin/magazine/schema";
import {
  getIssueByIdForAdmin,
  searchBooksForIssue,
} from "@/domain/magazine/queries";
import { addIssueBook } from "@/domain/magazine/mutations";
import AddBookModal from "@/features/dashboard/admin/magazine/components/AddBookModal";
import { SelectedBooksList } from "@/features/dashboard/admin/magazine/components/SelectedBooks";
import Alert from "@/components/app/Alert";
import { showErrorAlert } from "@/lib/alertHelpers";

// Opens the "add a book" modal and serves its live-search results. alpine-ajax
// extracts `modal-root` when the modal first opens and `add-book-results` on
// each keystroke, so one response body covers both.
export const GET = createRoute(paramValidator(idSchema), async (c) => {
  const id = c.req.valid("param").id;
  const query = c.req.query("q") ?? "";

  const [error, issue] = await getIssueByIdForAdmin(id);
  if (error || !issue) {
    return showErrorAlert(c, error?.reason ?? "Issue not found");
  }

  const results = await searchBooksForIssue(id, query);

  const action = `/dashboard/admin/magazine/${id}`;
  return c.html(
    <AddBookModal action={action} query={query} results={results} />,
  );
});

// Adds the chosen book to the end of the issue, then re-renders the whole book
// list (positions shift) and prepends a toast.
export const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineBookActionSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const { bookId } = c.req.valid("form");

    const [addErr] = await addIssueBook(id, bookId);
    if (addErr) return showErrorAlert(c, addErr.reason);

    const [loadErr, issue] = await getIssueByIdForAdmin(id);
    if (loadErr || !issue) {
      return showErrorAlert(c, loadErr?.reason ?? "Issue not found");
    }

    const action = `/dashboard/admin/magazine/${id}`;
    return c.html(
      <>
        <SelectedBooksList issue={issue} action={action} />
        <Alert type="success" message="Book added" />
      </>,
    );
  },
);
