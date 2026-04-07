import { createRoute } from "hono-fsr";
import { formValidator, queryValidator } from "../../../../../lib/validator";
import {
  featuredBooksFormSchema,
  weekQuerySchema,
} from "../../../../../features/dashboard/admin/planner/schema";
import ScheduleFeaturedModal from "../../../../../features/dashboard/admin/planner/modals/ScheduleFeaturedModal";
import { setFeaturedBooksForWeek } from "../../../../../features/dashboard/admin/planner/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../lib/disatchEvents";

export const GET = createRoute(queryValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("query").week;
  return c.html(<ScheduleFeaturedModal week={week} />);
});

export const POST = createRoute(
  formValidator(featuredBooksFormSchema),
  async (c) => {
    const form = c.req.valid("form");
    const weekStart = form.weekStart;
    const bookIds: [string, string, string, string, string] = [
      form.bookId1,
      form.bookId2,
      form.bookId3,
      form.bookId4,
      form.bookId5,
    ];

    const result = await setFeaturedBooksForWeek(weekStart, bookIds);

    if (!result.ok)
      return showErrorAlert(c, result.error ?? "Failed to set featured books.");

    return c.html(
      <>
        <Alert type="success" message="Featured books set!" />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
