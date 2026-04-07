import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { sendBookCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import { toWeekString } from "../../../../../lib/utils";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { getCreatorEmailById } from "../../../../../features/dashboard/creators/services";
import Modal from "../../../../../components/app/Modal";
import {
  sendBookOfTheWeekCreatorEmail,
  sendFeaturedBookCreatorEmail,
} from "../../../../../features/dashboard/admin/planner/utils";
import { capitalize } from "../../../../../utils";
import SetCreatorEmailModal from "../../../../../features/dashboard/admin/planner/modals/SetCreatorEmailModal";
import { getBookById } from "../../../../../features/dashboard/books/services";

export const POST = createRoute(
  formValidator(sendBookCreatorEmailFormSchema),
  async (c) => {
    const bookId = c.req.valid("form").bookId;
    const creatorId = c.req.valid("form").creatorId;
    const weekStart = c.req.valid("form").weekStart;
    const recipientType = c.req.valid("form").recipientType;

    const [err, creator] = await getCreatorEmailById(creatorId);
    if (err || !creator) return showErrorAlert(c, "Creator not found");

    if (!creator.email)
      return c.html(
        <Modal title={`Send ${capitalize(recipientType)} Email`}>
          <SetCreatorEmailModal
            creatorId={creatorId}
            bookId={bookId}
            recipientType={recipientType}
            weekStart={weekStart}
            action={`/dashboard/admin/planner/featured/set-send-email`}
          />
        </Modal>,
      );

    const [bookError, featuredBook] = await getBookById(bookId);
    if (bookError || !featuredBook) return showErrorAlert(c, "Book not found");

    return sendFeaturedBookCreatorEmail(
      c,
      toWeekString(weekStart),
      recipientType,
      bookId,
      creator,
    );
  },
);
