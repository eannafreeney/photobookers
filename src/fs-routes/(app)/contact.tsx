import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import SectionTitle from "../../components/app/SectionTitle";
import ContactForm from "../../features/app/forms/ContactForm";
import { createRoute } from "hono-fsr";
import { contactFormSchema } from "../../features/app/schema";
import { formValidator } from "../../lib/validator";
import { match } from "node:assert";
import { sendAdminEmail } from "../../lib/sendEmail";
import { generateContactEmail } from "../../features/app/emails";
import { showErrorAlert } from "../../lib/alertHelpers";
import { setFlash } from "../../utils";
import { ContactFormContext } from "../../features/app/types";

export const GET = createRoute(async (c: Context) => {
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Contact" currentPath={currentPath}>
      <Page>
        <SectionTitle>Contact</SectionTitle>
        <p class="mb-6 text-on-surface-weak">
          Send us a message and we’ll get back to you as soon as we can.
        </p>
        <ContactForm />
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(
  formValidator(contactFormSchema),
  async (c: ContactFormContext) => {
    const form = c.req.valid("form");

    // 🍯 1. Honeypot (bots fill this)
    if (form.website) return c.redirect("/");

    // ⏱️ 2. Time check (bots are instant)
    const ts = Number(form.ts);
    if (!ts || Date.now() - ts < 3000) {
      return c.redirect("/");
    }

    // 🧠 3. Content heuristics (cheap + effective)
    const msg = String(form.message || "");

    // too many links → spam
    if ((msg.match(/http/gi) || []).length > 2) {
      return c.redirect("/");
    }

    // nonsense length
    if (msg.length < 10 || msg.length > 2000) {
      return c.redirect("/");
    }

    // optional: block obvious keywords
    if (/viagra|casino|crypto|loan/gi.test(msg)) {
      return c.redirect("/");
    }

    const [error] = await sendAdminEmail(
      "New Contact Form Submission",
      generateContactEmail(form),
    );

    if (error) return showErrorAlert(c, error.reason);

    await setFlash(c, "success", "Contact form submitted successfully");
    return c.redirect("/");
  },
);
