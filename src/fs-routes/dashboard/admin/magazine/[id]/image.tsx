import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { magazineImageFormSchema } from "@/features/dashboard/admin/magazine/schema";
import { getIssueByIdForAdmin } from "@/domain/magazine/queries";
import { updateIssueBookImage } from "@/domain/magazine/mutations";
import SelectImageModal, {
  collectPlacementImageOptions,
} from "@/features/dashboard/admin/magazine/components/SelectImageModal";
import IssueBookCard from "@/features/dashboard/admin/magazine/components/IssueBookCard";
import Alert from "@/components/app/Alert";
import { showErrorAlert } from "@/lib/alertHelpers";

// Opens the "choose featured image" modal for one book in the issue.
export const GET = createRoute(paramValidator(idSchema), async (c) => {
  const id = c.req.valid("param").id;
  const bookId = c.req.query("bookId") ?? "";
  if (!bookId) return showErrorAlert(c, "Missing book.");

  const [error, issue] = await getIssueByIdForAdmin(id);
  if (error || !issue) {
    return showErrorAlert(c, error?.reason ?? "Issue not found");
  }

  const placement = issue.placements.find((p) => p.bookId === bookId);
  if (!placement) return showErrorAlert(c, "Book is not in this issue");

  const action = `/dashboard/admin/magazine/${id}`;
  return c.html(
    <SelectImageModal
      action={action}
      bookId={placement.bookId}
      number={placement.number}
      title={placement.book?.title ?? "Untitled"}
      imageOptions={collectPlacementImageOptions(placement.book)}
      selectedImageUrl={placement.selectedImageUrl}
    />,
  );
});

// Saves the chosen image (or clears it) and swaps the book card in place.
export const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineImageFormSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const { bookId, imageUrl } = c.req.valid("form");

    const selectedImageUrl = imageUrl?.trim() || null;
    const [saveErr] = await updateIssueBookImage(id, bookId, selectedImageUrl);
    if (saveErr) return showErrorAlert(c, saveErr.reason);

    const [loadErr, issue] = await getIssueByIdForAdmin(id);
    if (loadErr || !issue) {
      return showErrorAlert(c, loadErr?.reason ?? "Issue not found");
    }
    const placement = issue.placements.find((p) => p.bookId === bookId);
    if (!placement) {
      return showErrorAlert(c, "Image saved, but the card failed to render.");
    }

    const action = `/dashboard/admin/magazine/${id}`;
    return c.html(
      <>
        <IssueBookCard
          number={placement.number}
          bookId={placement.bookId}
          book={placement.book}
          blurb={placement.blurb}
          action={action}
          selectedImageUrl={placement.selectedImageUrl}
          artistPrompt={placement.artistPrompt}
          artistQuote={placement.artistQuote}
          artistEmailSentAt={placement.artistEmailSentAt}
        />
        <Alert type="success" message="Featured image updated." />
      </>,
    );
  },
);
