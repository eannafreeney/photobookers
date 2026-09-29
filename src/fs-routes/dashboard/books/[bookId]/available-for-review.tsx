import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator";
import { bookIdSchema } from "../../../../schemas";
import { requireBookEditAccess } from "../../../../middleware/bookGuard";
import { setFlash } from "../../../../utils";
import { setAvailableForReview } from "../../../../domain/reviews/services";
import { parseCheckboxField } from "../../../../schemas";
import type { BookIdContext } from "../../../../features/dashboard/books/types";

export const POST = createRoute(
  paramValidator(bookIdSchema),
  requireBookEditAccess,
  async (c: BookIdContext) => {
    const bookId = c.req.valid("param").bookId;
    const body = await c.req.parseBody();
    const [error] = await setAvailableForReview(
      bookId,
      parseCheckboxField(body.available),
    );
    await setFlash(
      c,
      error ? "danger" : "success",
      error?.reason ?? "Review copy setting saved",
    );
    return c.redirect(`/dashboard/books/${bookId}`);
  },
);
