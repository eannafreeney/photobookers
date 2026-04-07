import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator";
import {
  sendArtistEmailFormSchema,
  weekQuerySchema,
} from "../../../../../features/dashboard/admin/planner/schema";
import { parseWeekString } from "../../../../../lib/utils";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { getCreatorEmailById } from "../../../../../features/dashboard/creators/services";
import Modal from "../../../../../components/app/Modal";
import Input from "../../../../../components/forms/Input";
import Button from "../../../../../components/app/Button";
import { sendBookOfTheWeekArtistEmail } from "../../../../../features/dashboard/admin/planner/utils";

export const POST = createRoute(
  formValidator(sendArtistEmailFormSchema),
  paramValidator(weekQuerySchema),
  async (c) => {
    const week = c.req.valid("param").week;
    const weekStart = parseWeekString(week);
    const bookId = c.req.valid("form").bookId;

    if (Number.isNaN(weekStart.getTime())) {
      return showErrorAlert(c, "Invalid week");
    }
    const creatorId = c.req.valid("form").creatorId;
    const [err, creator] = await getCreatorEmailById(creatorId);
    if (err || !creator) return showErrorAlert(c, "Creator not found");

    if (!creator.email)
      return c.html(
        <Modal title="Send Artist Email">
          <p class="text-xs text-on-surface-strong">
            No email found for this creator. Please update the creator&apos;s
            email.
          </p>
          <form
            method="post"
            action={`/dashboard/admin/planner/book-of-the-week/set-creator-email-send-artist-email`}
            class="flex flex-col gap-3"
            x-target="toast modal-root"
          >
            <Input label="Email" type="email" name="email" />
            <input type="hidden" name="creatorId" value={creatorId} />
            <input type="hidden" name="bookId" value={bookId} />
            <Button variant="solid" color="primary">
              Submit
            </Button>
          </form>
        </Modal>,
      );

    return sendBookOfTheWeekArtistEmail(
      c,
      { displayName: creator.displayName, email: creator.email },
      bookId,
    );
  },
);
