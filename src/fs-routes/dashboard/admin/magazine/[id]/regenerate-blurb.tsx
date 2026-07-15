import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { magazineBookActionSchema } from "@/features/dashboard/admin/magazine/schema";
import { getIssueByIdForAdmin } from "@/domain/magazine/queries";
import { updateIssueBookBlurb } from "@/domain/magazine/mutations";
import { regenerateBlurbForBook } from "@/features/dashboard/admin/magazine/generate";
import MovementBookCard from "@/features/dashboard/admin/magazine/components/MovementBookCard";
import Alert from "@/components/app/Alert";
import { showErrorAlert } from "@/lib/alertHelpers";

export const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineBookActionSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const { bookId } = c.req.valid("form");

    const [loadErr, issue] = await getIssueByIdForAdmin(id);
    if (loadErr || !issue) {
      return showErrorAlert(c, loadErr?.reason ?? "Issue not found");
    }

    const [genErr, result] = await regenerateBlurbForBook(issue, bookId);
    if (genErr) return showErrorAlert(c, genErr.reason);

    const [saveErr] = await updateIssueBookBlurb(id, bookId, result.blurb);
    if (saveErr) return showErrorAlert(c, saveErr.reason);

    // Book/slot are unchanged, so re-render from the already-loaded placement
    // with the new blurb rather than re-querying.
    const placement = issue.placements.find((p) => p.bookId === bookId);
    if (!placement) {
      return showErrorAlert(c, "Blurb saved, but the card failed to render.");
    }

    const action = `/dashboard/admin/magazine/${id}`;
    return c.html(
      <>
        <MovementBookCard
          number={placement.number}
          bookId={placement.bookId}
          book={placement.book}
          blurb={result.blurb}
          action={action}
          artistPrompt={placement.artistPrompt}
          artistQuote={placement.artistQuote}
          artistEmailSentAt={placement.artistEmailSentAt}
        />
        <Alert type="success" message="Blurb rewritten." />
      </>,
    );
  },
);
