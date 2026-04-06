import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import Page from "../../components/layouts/Page";
import AppLayout from "../../components/layouts/AppLayout";
import InfoPage from "../../pages/InfoPage";
import { getAllCreatorsByType } from "../../features/app/services";
import PageTitle from "../../components/app/PageTitle";
import CreatorsCircle from "../../features/app/components/CreatorsCircle";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;

  const [error, result] = await getAllCreatorsByType("artist", currentPage);

  if (error) return c.html(<InfoPage errorMessage="Artists not found" />);

  const title = "Artists";
  const { creators } = result;

  return c.html(
    <AppLayout title={title} user={user} currentPath={currentPath}>
      <Page>
        <PageTitle title="" />
        <div class="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-6">
          {creators.map((creator) => (
            <CreatorsCircle creator={creator} />
          ))}
        </div>
      </Page>
    </AppLayout>,
  );
});
