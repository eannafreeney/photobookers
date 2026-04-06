import { createRoute } from "hono-fsr";
import Modal from "../../components/app/Modal";
import { Context } from "hono";
import NewsletterModalForm from "../../features/app/components/NewsletterForm";
import { newsletterFormSchema } from "../../features/api/schema";
import { formValidator } from "../../lib/validator";
import { NewsletterFormContext } from "../../features/api/types";
import { showErrorAlert, showSuccessAlert } from "../../lib/alertHelpers";
import NewsletterCard from "../../features/app/components/NewsletterCard";
import Alert from "../../components/app/Alert";

export const GET = createRoute(async (c: Context) => {
  return c.html(
    <Modal title="Sign up for our newsletter">
      <NewsletterModalForm />
    </Modal>,
  );
});

export const POST = createRoute(
  formValidator(newsletterFormSchema),
  async (c: NewsletterFormContext) => {
    const form = c.req.valid("form");
    const email = form.email;

    const apiKey = process.env.MAILER_LITE_API_KEY;
    if (!apiKey) {
      console.error("MAILERLITE_API_KEY is not set");
      return showErrorAlert(c, "Newsletter signup is not configured.");
    }

    const body: { email: string; groups?: string[] } = { email };
    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 422) {
        return showErrorAlert(c, "Invalid email or already subscribed.");
      }

      return showErrorAlert(c, "Could not sign up. Try again later.");
    }

    return showSuccessAlert(c, "Newsletter signup successful");
  },
);
