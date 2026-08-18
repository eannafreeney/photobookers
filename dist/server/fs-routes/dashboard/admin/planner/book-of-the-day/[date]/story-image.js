import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { dateQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema.js";
import { parseDateString } from "../../../../../../lib/utils.js";
import { showErrorAlert } from "../../../../../../lib/alertHelpers.js";
import Alert from "../../../../../../components/app/Alert.js";
import { db } from "../../../../../../db/client.js";
import { bookOfTheDay } from "../../../../../../db/schema.js";
import { eq } from "drizzle-orm";
import { dispatchEvents } from "../../../../../../lib/disatchEvents.js";
const POST = createRoute(
  paramValidator(dateQuerySchema),
  async (c) => {
    const date = c.req.valid("param").date;
    const day = parseDateString(date);
    if (Number.isNaN(day.getTime())) return showErrorAlert(c, "Invalid date");
    const form = await c.req.formData();
    const url = form.get("artistProvidedStoryImageUrl")?.toString().trim() ?? "";
    await db.update(bookOfTheDay).set({ artistProvidedStoryImageUrl: url || null, updatedAt: /* @__PURE__ */ new Date() }).where(eq(bookOfTheDay.date, day));
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Story image updated!" }),
        dispatchEvents(["planner:updated"])
      ] })
    );
  }
);
export {
  POST
};
