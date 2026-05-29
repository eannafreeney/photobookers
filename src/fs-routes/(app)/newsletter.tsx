import { createRoute } from "hono-fsr";
import Modal from "../../components/app/Modal";
import { Context } from "hono";
import NewsletterModalForm from "../../features/app/components/NewsletterForm";
import { newsletterFormSchema } from "../../features/api/schema";
import { formValidator } from "../../lib/validator";
import { NewsletterFormContext } from "../../features/api/types";
import { showErrorAlert, showSuccessAlert } from "../../lib/alertHelpers";
import { getIsHyperview } from "../../features/hyperview/lib";
import { hyperview } from "../../lib/hxml";
import { HyperviewNewsletterFormFields } from "../../features/hyperview/components/NewsletterCard";
import { getBaseUrl } from "../../lib/hyperview";

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
    const isHyperview = getIsHyperview(c);
    return isHyperview ? postNewsletterHyperview(c) : postNewsletterWeb(c);
  },
);

const postNewsletterHyperview = async (c: NewsletterFormContext) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const email = c.req.valid("form").email;
  const result = await subscribeEmail(email);

  if (!result.ok) {
    return hv(
      <HyperviewNewsletterFormFields
        baseUrl={baseUrl}
        email={email}
        submitLabel={result.message}
      />,
      422,
    );
  }

  return hv(
    <HyperviewNewsletterFormFields
      baseUrl={baseUrl}
      email=""
      submitLabel="Signed up!"
      showSubmitBehavior={false}
    />,
  );
};

const postNewsletterWeb = async (c: NewsletterFormContext) => {
  const email = c.req.valid("form").email;
  const result = await subscribeEmail(email);

  if (!result.ok) {
    return showErrorAlert(c, result.message);
  }

  return showSuccessAlert(c, "Signed up for newsletter!");
};

const subscribeEmail = async (email: string) => {
  const apiKey = process.env.MAILER_LITE_API_KEY;
  if (!apiKey) {
    console.error("MAILERLITE_API_KEY is not set");
    return {
      ok: false as const,
      message: "Newsletter signup is not configured.",
    };
  }

  const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    if (res.status === 422) {
      return {
        ok: false as const,
        message: "Invalid email or already subscribed.",
      };
    }
    return {
      ok: false as const,
      message: "Could not sign up. Try again later.",
    };
  }

  return { ok: true as const };
};
