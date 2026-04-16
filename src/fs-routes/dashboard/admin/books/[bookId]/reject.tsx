import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator";
import { bookIdSchema } from "../../../../../schemas";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import {
  approveBook,
  rejectBook,
} from "../../../../../features/dashboard/admin/books/services";

import BookApprovalStatusPill from "../../../../../features/dashboard/admin/books/components/BookApprovalStatusPill";
import Alert from "../../../../../components/app/Alert";
import Modal from "../../../../../components/app/Modal";
import FormPost from "../../../../../components/forms/FormPost";
import TextArea from "../../../../../components/forms/TextArea";
import z from "zod";
import Button from "../../../../../components/app/Button";
import PublishToggleForm from "../../../../../features/dashboard/books/components/PublishToggleForm";
import { getUser } from "../../../../../utils";

const rejectBookFormSchema = z.object({
  feedback: z.string().optional(),
});

export const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const { bookId } = c.req.valid("param");

  const alpineAttrs = {
    "x-target": "toast book-approval-status book-publish-toggle",
    "@ajax:after": "$dispatch('dialog:close')",
  };

  return c.html(
    <Modal title="Reject book / Send feedback">
      <FormPost
        action={`/dashboard/admin/books/${bookId}/reject`}
        {...alpineAttrs}
      >
        <TextArea name="feedback" />
        <input type="hidden" name="bookId" value={bookId} />
        <div class="flex justify-end gap-2">
          <Button
            variant="outline"
            color="inverse"
            type="button"
            x-on:click="$dispatch('dialog:close')"
          >
            Cancel
          </Button>
          <Button variant="solid" color="danger">
            Send feedback &amp; reject
          </Button>
        </div>
      </FormPost>
    </Modal>,
  );
});

export const POST = createRoute(
  paramValidator(bookIdSchema),
  formValidator(rejectBookFormSchema),
  async (c) => {
    const user = await getUser(c);
    const { bookId } = c.req.valid("param");
    const { feedback } = c.req.valid("form");

    const [error, book] = await rejectBook(bookId, feedback);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message="Book rejected!" />
        <BookApprovalStatusPill
          approvalStatus={book.approvalStatus ?? "rejected"}
        />
        <PublishToggleForm book={book} user={user} />
      </>,
    );
  },
);
