import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { dateQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema";
import { parseDateString } from "../../../../../../lib/utils";
import { showErrorAlert } from "../../../../../../lib/alertHelpers";
import Alert from "../../../../../../components/app/Alert";
import { db } from "../../../../../../db/client";
import { bookOfTheDay } from "../../../../../../db/schema";
import { eq } from "drizzle-orm";
import { dispatchEvents } from "../../../../../../lib/disatchEvents";

export const POST = createRoute(
  paramValidator(dateQuerySchema),
  async (c) => {
    const date = c.req.valid("param").date;
    const day = parseDateString(date);
    if (Number.isNaN(day.getTime())) return showErrorAlert(c, "Invalid date");

    const form = await c.req.formData();
    const url = form.get("artistProvidedStoryImageUrl")?.toString().trim() ?? "";

    await db
      .update(bookOfTheDay)
      .set({ artistProvidedStoryImageUrl: url || null, updatedAt: new Date() })
      .where(eq(bookOfTheDay.date, day));

    return c.html(
      <>
        <Alert type="success" message="Story image updated!" />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
