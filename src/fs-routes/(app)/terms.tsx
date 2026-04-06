import { createRoute } from "hono-fsr";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";

export const GET = createRoute(async (c) => {
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Terms and Conditions" currentPath={currentPath}>
      <Page>
        <div class="container mx-auto max-w-4xl flex flex-col gap-4">
          <div>
            1. Introduction & agreement Name of service: “Photobookers”. These
            terms govern use of the website and services. By registering or
            using the site, users agree to these terms.
          </div>{" "}
          <div>
            2. Definitions User / Account: anyone with an account. Creator /
            Artist / Publisher: users who upload and manage books. Fan: users
            who follow, wishlist, and collect. Content: any text, images, data,
            or other material uploaded or shared on the platform.
          </div>
          <div>
            3. Accounts Users must provide accurate information and keep it
            updated. Account is personal; no sharing credentials or
            impersonation. Users are responsible for activity under their
            account. You may suspend or terminate accounts for breach of terms
            or for other stated reasons.
          </div>{" "}
          <div>
            4. User-generated content (UGC) Creators: They retain ownership of
            their content (books, images, text) but grant Photobookers a license
            to use, store, display, and distribute that content to operate the
            service (e.g. show books, feeds, search). They confirm they have the
            rights to upload the content (no infringement of others’ IP or
            personality rights). All users: Must not upload illegal, defamatory,
            harassing, or infringing content. You reserve the right to remove
            content and suspend/terminate accounts without notice if content
            violates terms or law.
          </div>{" "}
          <div>
            5. Acceptable use No: spam, scraping, bots, impersonation,
            harassment, illegal activity, circumventing security or access
            controls. Use of the service only for lawful purposes and in line
            with these terms.
          </div>{" "}
          <div>
            6. Intellectual property Photobookers owns the site, design,
            branding, and any non-user content. Trademarks and logos may not be
            used without permission. DMCA / copyright: how to report
            infringement (contact email, what to include), and that you may
            terminate repeat infringers.
          </div>{" "}
          <div>
            7. Privacy Reference your Privacy Policy for collection, use, and
            sharing of personal data. Short note that data may be processed and
            that signing up implies consent where required.
          </div>{" "}
          <div>
            8. Disclaimer of warranties Service provided “as is” and “as
            available.” No warranty of uninterrupted, error-free, or secure
            operation .
          </div>{" "}
          <div>
            9. Limitation of liability To the maximum extent permitted by law,
            Photobookers are not liable for indirect, incidental, consequential,
            or punitive damages, or for loss of data, profits, or business.
          </div>{" "}
          <div>
            10. Indemnification Users agree to indemnify and hold Photobookers
            harmless from claims, damages, and costs arising from their use of
            the service, their content, or their breach of terms.
          </div>{" "}
          <div>
            11. Changes to terms You may update the terms; continued use after
            changes constitutes acceptance. For material changes, you will
            notify users (e.g. email or prominent notice on the site) and, where
            required (e.g. EU), give advance notice and option to object or
            terminate.
          </div>{" "}
          <div>
            12. Termination Users may close their account. You may terminate or
            suspend accounts as set out in these terms. Effect of termination:
            right to use the service ends; clauses that by nature survive
            continue to apply.
          </div>{" "}
          <div>
            13. General Governing law and jurisdiction: Severability: if one
            clause is invalid, the rest remain in effect. Entire agreement:
            these terms (plus Privacy Policy and any other referenced policies)
            are the full agreement regarding the service. Contact How to contact
            you for terms-related questions, copyright reports, and support
            (email and/or address).
          </div>{" "}
        </div>
      </Page>
    </AppLayout>,
  );
});
