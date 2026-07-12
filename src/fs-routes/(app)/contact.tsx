import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import PageHeader from "../../components/app/PageHeader";
import ContactForm from "../../features/app/forms/ContactForm";
import { createRoute } from "hono-fsr";
import { isContactSpam } from "../../features/app/contactSpam";
import { contactFormSchema } from "../../features/app/schema";
import { formValidator } from "../../lib/validator";
import { sendAdminEmail } from "../../lib/sendEmail";
import { generateContactEmail } from "../../features/app/emails";
import { showErrorAlert } from "../../lib/alertHelpers";
import { ContactFormContext } from "../../features/app/types";
import { canonicalUrl, pageTitle } from "../../lib/seo";
import Alert from "../../components/app/Alert";

export const GET = createRoute(async (c: Context) => {
  const currentPath = c.req.path;

  const title = pageTitle("Contact");
  const description = "Get in touch with the photobookers team.";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/contact")}
      currentPath={currentPath}
    >
      <Page>
        <PageHeader
          kicker="Get in Touch"
          title="Contact"
          intro="Send us a message and we’ll get back to you as soon as we can."
        />
        <div class="mx-auto w-full max-w-2xl">
          <ContactForm />
        </div>
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(
  formValidator(contactFormSchema),
  async (c: ContactFormContext) => {
    const form = c.req.valid("form");

    if (
      isContactSpam({
        website: form.website,
        ts: form.ts,
        message: form.message,
      }).spam
    ) {
      return c.redirect("/");
    }

    // ponytail: e2e dev server sets CONTACT_E2E=1 to skip Supabase email invoke
    if (process.env.CONTACT_E2E !== "1") {
      const [error] = await sendAdminEmail(
        "New Contact Form Submission",
        generateContactEmail(form),
      );

      if (error) return showErrorAlert(c, error.reason);
    }

    return c.html(
      <>
        <Alert
          type="success"
          message="Message sent — we'll get back to you soon."
        />
        <ContactForm />
      </>,
    );
  },
);
