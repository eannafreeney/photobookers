import { createRoute } from "hono-fsr";
import { Context } from "hono";
import InfoPage from "../../../pages/InfoPage";
import { getUser, setFlash } from "../../../utils";
import { isFeatureEnabledForUser } from "../../../lib/features";
import { submitPrinterRecommendation } from "../../../features/app/printers/services";
import { printerRecommendationSchema } from "../../../features/app/printers/schema";
import RecommendPrinterForm from "../../../features/app/printers/components/RecommendPrinterForm";

import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers";
import Modal from "../../../components/app/Modal";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  if (!isFeatureEnabledForUser("printers", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  return c.html(
    <Modal title="Recommend a printer" maxWidth="max-w-lg">
      <p class="text-on-surface text-pretty">
        We're always looking for new printers to add to our list. If you know of
        a printer that you think is great, please let us know.
      </p>
      <RecommendPrinterForm />
    </Modal>,
  );
});

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);
  if (!isFeatureEnabledForUser("printers", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }
  if (!user) return showErrorAlert(c, "Sign in to recommend a printer", 401);

  const body = await c.req.parseBody();
  const parsed = printerRecommendationSchema.safeParse(body);
  if (!parsed.success) {
    return showErrorAlert(
      c,
      parsed.error.issues[0]?.message ?? "Check the form",
    );
  }

  const [error] = await submitPrinterRecommendation(parsed.data, user);
  if (error) return showErrorAlert(c, error.reason);

  const message = `Thanks. We'll look at ${parsed.data.name}.`;

  return showSuccessAlert(c, message);
});
