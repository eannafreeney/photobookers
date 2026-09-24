import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { paramValidator } from "../../../../lib/validator";
import { slugSchema } from "../../../../features/app/schema";
import { routeParam } from "../../../../lib/routeParam";
import { getUser, setFlash } from "../../../../utils";
import InfoPage from "../../../../pages/InfoPage";
import { isFeatureEnabledForUser } from "../../../../lib/features";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { printerNoteSchema } from "../../../../features/app/printers/schema";
import {
  createPrinterNote,
  getPrinterBySlug,
  userCanNotePrinter,
} from "../../../../features/app/printers/services";

export const POST = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const user = await getUser(c);
    if (!isFeatureEnabledForUser("printers", user)) {
      return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
    }
    if (!user) return showErrorAlert(c, "Sign in to leave a note", 401);

    const slug = routeParam(c, "slug");
    const [printerError, printer] = await getPrinterBySlug(slug);
    if (printerError) return showErrorAlert(c, printerError.reason, 404);

    const body = await c.req.parseBody();
    const parsed = printerNoteSchema.safeParse(body);
    if (!parsed.success) {
      return showErrorAlert(
        c,
        parsed.error.issues[0]?.message ?? "Check the note",
      );
    }

    const [accessError, access] = await userCanNotePrinter(user.id, printer.id);
    if (accessError) return showErrorAlert(c, accessError.reason);
    if (!access.canNote) {
      return showErrorAlert(
        c,
        "Request a quote from this printer before leaving a note",
      );
    }

    const [noteError] = await createPrinterNote({
      userId: user.id,
      printerId: printer.id,
      requestId: access.requestId,
      replied: parsed.data.replied,
      printed: parsed.data.printed,
      body: parsed.data.body,
    });
    if (noteError) return showErrorAlert(c, noteError.reason);

    await setFlash(c, "success", "Note saved.");
    return c.redirect(`/printers/${printer.slug}`, 303);
  },
);
