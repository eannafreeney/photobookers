import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import Modal from "../../components/app/Modal.js";
import NewsletterModalForm from "../../features/app/components/NewsletterModalForm.js";
import { newsletterFormSchema } from "../../features/api/schema.js";
import { formValidator } from "../../lib/validator.js";
import { showErrorAlert, showSuccessAlert } from "../../lib/alertHelpers.js";
import { getIsHyperview } from "../../features/hyperview/lib.js";
import { hyperview } from "../../lib/hxml.js";
import { HyperviewNewsletterFormFields } from "../../features/hyperview/components/NewsletterCard.js";
import { getBaseUrl } from "../../lib/hyperview.js";
import { ensureBrevoContact, getBrevoConfig } from "../../lib/brevo/client.js";
const GET = createRoute(async (c) => {
  return c.html(
    /* @__PURE__ */ jsx(Modal, { title: "Sign up for our newsletter", children: /* @__PURE__ */ jsx(NewsletterModalForm, {}) })
  );
});
const POST = createRoute(
  formValidator(newsletterFormSchema),
  async (c) => {
    const isHyperview = getIsHyperview(c);
    return isHyperview ? postNewsletterHyperview(c) : postNewsletterWeb(c);
  }
);
const postNewsletterHyperview = async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const email = c.req.valid("form").email;
  const result = await subscribeEmail(email);
  if (!result.ok) {
    return hv(
      /* @__PURE__ */ jsx(
        HyperviewNewsletterFormFields,
        {
          baseUrl,
          email,
          submitLabel: result.message
        }
      ),
      422
    );
  }
  return hv(
    /* @__PURE__ */ jsx(
      HyperviewNewsletterFormFields,
      {
        baseUrl,
        email: "",
        submitLabel: "Signed up!",
        showSubmitBehavior: false
      }
    )
  );
};
const postNewsletterWeb = async (c) => {
  const email = c.req.valid("form").email;
  const result = await subscribeEmail(email);
  if (!result.ok) {
    return showErrorAlert(c, result.message);
  }
  return showSuccessAlert(c, "Signed up for newsletter!");
};
const subscribeEmail = async (email) => {
  const [configError, config] = getBrevoConfig();
  if (configError) {
    console.error("Brevo newsletter signup is not configured:", configError.reason);
    return {
      ok: false,
      message: "Newsletter signup is not configured."
    };
  }
  const [contactError] = await ensureBrevoContact(
    config.apiKey,
    email,
    [config.listId]
  );
  if (contactError) {
    if (contactError.status === 400) {
      return {
        ok: false,
        message: "Invalid email or already subscribed."
      };
    }
    return {
      ok: false,
      message: "Could not sign up. Try again later."
    };
  }
  return { ok: true };
};
export {
  GET,
  POST
};
