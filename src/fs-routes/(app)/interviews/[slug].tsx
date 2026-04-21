import { createRoute } from "hono-fsr";
import SectionTitle from "../../../components/app/SectionTitle";
import Page from "../../../components/layouts/Page";
import AppLayout from "../../../components/layouts/AppLayout";
import InfoPage from "../../../pages/InfoPage";
import { getInterviewByCreatorSlug } from "../../../features/app/services";

export const GET = createRoute(async (c) => {
  const currentPath = c.req.path;
  const slug = c.req.param("slug");
  const [error, interview] = await getInterviewByCreatorSlug(slug);
  if (error) return c.html(<InfoPage errorMessage={error.reason} />);
  if (!interview)
    return c.html(<InfoPage errorMessage="Interview not found" />);

  return c.html(
    <AppLayout title="About" currentPath={currentPath}>
      <Page>
        <SectionTitle>About</SectionTitle>
      </Page>
    </AppLayout>,
  );
});
