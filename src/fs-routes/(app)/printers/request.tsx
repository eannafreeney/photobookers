import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import PageHeader from "../../../components/app/PageHeader";
import InfoPage from "../../../pages/InfoPage";
import { getFlash, getUser, setFlash } from "../../../utils";
import { canonicalUrl, pageTitle } from "../../../lib/seo";
import { isFeatureEnabledForUser } from "../../../lib/features";
import { getPublishedPrinters, submitQuoteRequest } from "../../../features/app/printers/services";
import { quoteRequestSchema } from "../../../features/app/printers/schema";
import QuoteRequestForm from "../../../features/app/printers/components/QuoteRequestForm";
import MemberSignInPrompt, {
  memberSignInPrompts,
} from "../../../features/app/components/MemberSignInPrompt";
import { showErrorAlert } from "../../../lib/alertHelpers";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  if (!isFeatureEnabledForUser("printers", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const flash = await getFlash(c);
  const preselectedSlug = c.req.query("printer") || undefined;
  const [error, printers] = await getPublishedPrinters();
  if (error) {
    return c.html(<InfoPage errorMessage={error.reason} user={user} />, 500);
  }

  const requestUrl = new URL(c.req.url);
  const currentPath = requestUrl.pathname + requestUrl.search;

  return c.html(
    <AppLayout
      title={pageTitle("Ask a printer")}
      description="Send a short brief to up to three photobook printers."
      canonicalUrl={canonicalUrl(c.req.url, "/printers/request")}
      user={user}
      currentPath="/printers/request"
      flash={flash}
    >
      <Page>
        <PageHeader
          kicker="Make a book"
          title="Ask for a quote"
          intro="Pick up to three printers. They email you back. Photobookers does not take a cut."
        />
        {user ? (
          <QuoteRequestForm
            printers={printers}
            preselectedSlug={preselectedSlug}
          />
        ) : (
          <MemberSignInPrompt
            prompt={memberSignInPrompts.printers}
            currentPath={currentPath}
          />
        )}
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);
  if (!isFeatureEnabledForUser("printers", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }
  if (!user) return showErrorAlert(c, "Sign in to send a brief", 401);

  const body = await c.req.parseBody({ all: true });
  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return showErrorAlert(c, parsed.error.issues[0]?.message ?? "Check the form");
  }

  const [error, result] = await submitQuoteRequest(parsed.data, user);
  if (error) return showErrorAlert(c, error.reason);

  const names = result.printerNames.join(", ");
  const message =
    result.failed > 0
      ? `Saved your brief for ${names}, but ${result.failed} email${result.failed === 1 ? "" : "s"} did not send.`
      : `Sent your brief to ${names}. They will reply to you directly.`;

  await setFlash(c, result.failed > 0 ? "danger" : "success", message);
  return c.redirect("/printers/request", 303);
});
