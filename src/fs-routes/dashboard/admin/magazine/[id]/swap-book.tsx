import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { magazineBookActionSchema } from "@/features/dashboard/admin/magazine/schema";
import {
  getBookCardById,
  getIssueByIdForAdmin,
} from "@/domain/magazine/queries";
import { swapIssueBook } from "@/domain/magazine/mutations";
import { findReplacementForBook } from "@/features/dashboard/admin/magazine/generate";
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

    // The slot survives the swap (same movement + sortOrder), so its number —
    // which anchors the card's DOM id — is stable and known before the swap.
    const slot = issue.placements.find((p) => p.bookId === bookId);
    if (!slot) return showErrorAlert(c, "Book is not in this issue");

    const [genErr, replacement] = await findReplacementForBook(issue, bookId);
    if (genErr) return showErrorAlert(c, genErr.reason);

    const [swapErr] = await swapIssueBook(id, bookId, replacement.bookId, {
      blurb: replacement.blurb,
      artistPrompt: replacement.artistPrompt,
    });
    if (swapErr) return showErrorAlert(c, swapErr.reason);

    // One focused query for the new book's card data (cover/artist) — the
    // candidate the AI picked doesn't carry a cover url.
    const book = await getBookCardById(replacement.bookId);

    const action = `/dashboard/admin/magazine/${id}`;
    return c.html(
      <>
        <MovementBookCard
          number={slot.number}
          bookId={replacement.bookId}
          book={book}
          blurb={replacement.blurb}
          action={action}
          artistPrompt={replacement.artistPrompt}
        />
        <Alert type="success" message="Book swapped" />
      </>,
    );
  },
);
