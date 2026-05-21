import { createRoute } from "hono-fsr";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import { PRIVACY_SECTIONS } from "../../features/legal/privacyContent";

export const GET = createRoute(async (c) => {
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Privacy Policy" currentPath={currentPath}>
      <Page>
        <div class="container mx-auto max-w-4xl flex flex-col gap-4">
          {PRIVACY_SECTIONS.map((section) => (
            <div>{section}</div>
          ))}
        </div>
      </Page>
    </AppLayout>,
  );
});
