import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import { getFollowerFeed } from "../../features/app/services";
import Page from "../../components/layouts/Page";
import InfoPage from "../../pages/InfoPage";
import MemberSignInPrompt, {
  memberSignInPrompts,
} from "../../features/app/components/MemberSignInPrompt";
import { Context } from "hono";
import FollowerFeed from "../../features/app/components/FollowerFeed";
import PageHeader from "../../components/app/PageHeader";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  if (!user) {
    return c.html(
      <AppLayout
        title="Your Feed"
        user={user}
        flash={flash}
        currentPath={currentPath}
        noIndex
      >
        <Page>
          <div class="mx-auto w-full max-w-[600px]">
            <PageHeader
              kicker="Your Feed"
              title="From creators you follow"
              intro="The latest books and announcements from the artists and publishers you follow."
            />
            <MemberSignInPrompt
              prompt={memberSignInPrompts.feed}
              currentPath={currentPath}
            />
          </div>
        </Page>
      </AppLayout>,
    );
  }

  const [error, result] = await getFollowerFeed(user.id, currentPage);
  if (error) {
    return c.html(<InfoPage errorMessage={error.reason} user={user} />);
  }

  if (!result) {
    return c.html(
      <InfoPage errorMessage="Failed to load your feed" user={user} />,
    );
  }

  const { items, totalPages, page } = result;

  return c.html(
    <AppLayout
      title="Your Feed"
      user={user}
      flash={flash}
      currentPath={currentPath}
      noIndex
    >
      <Page>
        <div class="mx-auto w-full max-w-[600px] flex flex-col gap-4">
          <PageHeader
            kicker="Your Feed"
            title="From creators you follow"
            intro="The latest books and announcements from the artists and publishers you follow."
          />
          <FollowerFeed
            user={user}
            currentPath={currentPath}
            items={items}
            totalPages={totalPages}
            page={page}
          />
        </div>
      </Page>
    </AppLayout>,
  );
});
