import { createRoute } from "hono-fsr";
import z from "zod";
import Alert from "../../../../../components/app/Alert";
import Button from "../../../../../components/app/Button";
import FormPost from "../../../../../components/forms/FormPost";
import TextArea from "../../../../../components/forms/TextArea";
import Modal from "../../../../../components/app/Modal";
import { sendBookFeedback } from "../../../../../features/dashboard/admin/books/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { formValidator, paramValidator } from "../../../../../lib/validator";
import { bookIdSchema } from "../../../../../schemas";

const feedbackFormSchema = z.object({
  feedback: z.string().trim().min(1, "Feedback is required"),
});

export const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const { bookId } = c.req.valid("param");

  return c.html(
    <Modal title="Send feedback">
      <FormPost
        action={`/dashboard/admin/books/${bookId}/feedback`}
        x-target="toast"
        {...{ "x-on:ajax:after": "$dispatch('dialog:close')" }}
      >
        <TextArea label="Feedback" name="feedback" required />
        <div class="flex justify-end gap-2">
          <Button
            variant="outline"
            color="inverse"
            type="button"
            x-on:click="$dispatch('dialog:close')"
          >
            Cancel
          </Button>
          <Button variant="solid" color="primary">
            Send feedback
          </Button>
        </div>
      </FormPost>
    </Modal>,
  );
});

export const POST = createRoute(
  paramValidator(bookIdSchema),
  formValidator(feedbackFormSchema),
  async (c) => {
    const { bookId } = c.req.valid("param");
    const { feedback } = c.req.valid("form");

    const [error] = await sendBookFeedback(bookId, feedback);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <Alert type="success" message="Feedback sent!" />,
    );
  },
);
