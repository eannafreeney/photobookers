import { createRoute } from "hono-fsr";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import { TERMS_SECTIONS } from "../../features/legal/termsContent";

export const GET = createRoute(async (c) => {
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Terms and Conditions" currentPath={currentPath}>
      <Page>
        <div class="container mx-auto max-w-4xl flex flex-col gap-4">
          {TERMS_SECTIONS.map((section) => (
            <div>{section}</div>
          ))}
        </div>
      </Page>
    </AppLayout>,
  );
});
