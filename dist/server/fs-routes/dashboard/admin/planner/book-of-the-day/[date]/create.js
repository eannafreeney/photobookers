import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import {
  formValidator,
  paramValidator
} from "../../../../../../lib/validator.js";
import {
  bookOfTheDayFormSchema,
  dateQuerySchema
} from "../../../../../../features/dashboard/admin/planner/schema.js";
import ScheduleBOTDModal from "../../../../../../features/dashboard/admin/planner/modals/ScheduleBOTDModal.js";
import { setBookOfTheDay } from "../../../../../../features/dashboard/admin/planner/services.js";
import { showErrorAlert } from "../../../../../../lib/alertHelpers.js";
import Alert from "../../../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../../../lib/disatchEvents.js";
const GET = createRoute(paramValidator(dateQuerySchema), async (c) => {
  const date = c.req.valid("param").date;
  return c.html(/* @__PURE__ */ jsx(ScheduleBOTDModal, { date }));
});
const POST = createRoute(
  formValidator(bookOfTheDayFormSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const bookId = formData.bookId;
    const date = formData.date;
    const [error] = await setBookOfTheDay({
      date,
      bookId
    });
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Book of the Day set!" }),
        dispatchEvents(["planner:updated"])
      ] })
    );
  }
);
export {
  GET,
  POST
};
