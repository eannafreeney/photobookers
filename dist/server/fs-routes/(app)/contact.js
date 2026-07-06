import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import PageHeader from "../../components/app/PageHeader.js";
import ContactForm from "../../features/app/forms/ContactForm.js";
import { createRoute } from "hono-fsr";
import { contactFormSchema } from "../../features/app/schema.js";
import { formValidator } from "../../lib/validator.js";
import { sendAdminEmail } from "../../lib/sendEmail.js";
import { generateContactEmail } from "../../features/app/emails.js";
import { showErrorAlert } from "../../lib/alertHelpers.js";
import { setFlash } from "../../utils.js";
import { canonicalUrl, pageTitle } from "../../lib/seo.js";
const GET = createRoute(async (c) => {
  const currentPath = c.req.path;
  const title = pageTitle("Contact");
  const description = "Get in touch with the photobookers team.";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/contact"),
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "Get in Touch",
              title: "Contact",
              intro: "Send us a message and we\u2019ll get back to you as soon as we can."
            }
          ),
          /* @__PURE__ */ jsx("div", { class: "mx-auto w-full max-w-2xl", children: /* @__PURE__ */ jsx(ContactForm, {}) })
        ] })
      }
    )
  );
});
const POST = createRoute(
  formValidator(contactFormSchema),
  async (c) => {
    const form = c.req.valid("form");
    if (form.website) return c.redirect("/");
    const ts = Number(form.ts);
    if (!ts || Date.now() - ts < 3e3) {
      return c.redirect("/");
    }
    const msg = String(form.message || "");
    if ((msg.match(/http/gi) || []).length > 2) {
      return c.redirect("/");
    }
    if (msg.length < 10 || msg.length > 2e3) {
      return c.redirect("/");
    }
    if (/viagra|casino|crypto|loan/gi.test(msg)) {
      return c.redirect("/");
    }
    const [error] = await sendAdminEmail(
      "New Contact Form Submission",
      generateContactEmail(form)
    );
    if (error) return showErrorAlert(c, error.reason);
    await setFlash(c, "success", "Contact form submitted successfully");
    return c.redirect("/");
  }
);
export {
  GET,
  POST
};
