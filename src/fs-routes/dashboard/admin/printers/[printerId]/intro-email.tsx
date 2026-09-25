import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import { printerIdSchema } from "../../../../../features/dashboard/admin/printers/schema";
import { sendPrinterIntroEmail } from "../../../../../features/dashboard/admin/printers/services";
import PrinterIntroEmailToggle from "../../../../../features/dashboard/admin/printers/components/PrinterIntroEmailToggle";

export const POST = createRoute(paramValidator(printerIdSchema), async (c) => {
  const printerId = c.req.valid("param").printerId;
  const [error, printer] = await sendPrinterIntroEmail(printerId);
  if (error) return showErrorAlert(c, error.reason);

  return c.html(
    <>
      <PrinterIntroEmailToggle
        printerId={printer.id}
        sentAt={printer.introEmailSentAt}
      />
      <Alert type="success" message={`Intro email sent to ${printer.name}`} />
    </>,
  );
});
