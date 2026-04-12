import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../../utils";
import { getMessagesByCreator } from "../../../features/dashboard/messages/services";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs";
import MessageForm from "../../../features/dashboard/messages/forms/MessageForm";
import InfoPage from "../../../pages/InfoPage";
import CreatorMessages from "../../../features/app/components/CreatorMessages";
import NavTabs from "../../../features/dashboard/books/components/NavTabs";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  if (!user.creator)
    return c.html(<InfoPage errorMessage="Creator not found" />);

  //   console.log("creator", creator);

  const creator = user.creator;

  return c.html(
    <AppLayout title="Messages" user={user} currentPath={currentPath}>
      <Page>
        <Breadcrumbs
          items={[
            { label: "Dashboard" },
            { label: "Messages", href: "/dashboard/messages" },
          ]}
        />
        <NavTabs currentPath={currentPath} />
        <div class="grid grid-cols-2 gap-8">
          <MessageForm creatorId={creator.id} />
          <CreatorMessages creatorSlug={creator.slug} user={user} />
        </div>
      </Page>
    </AppLayout>,
  );
});
