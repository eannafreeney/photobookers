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
import { paginationRequestBaseUrl } from "../../lib/pagination";
import { FeedTab, parseFeedTab } from "../../features/app/followerFeed";

const kicker = "Your Feed";
const title = "From everyone you follow";
const intro =
  "Posts and new books from the artists, publishers, and collectors you follow.";

const tabClass = (active: boolean) =>
  `px-3 py-2 text-sm font-medium ${
    active
      ? "border-b-2 border-accent text-on-surface-strong"
      : "text-on-surface-weak"
  }`;

const FeedTabs = ({ tab }: { tab: FeedTab }) => (
  <div class="flex gap-2" role="tablist">
    <a
      href="/feed?tab=posts"
      role="tab"
      aria-selected={tab === "posts" ? "true" : "false"}
      class={tabClass(tab === "posts")}
    >
      Posts
    </a>
    <a
      href="/feed?tab=books"
      role="tab"
      aria-selected={tab === "books" ? "true" : "false"}
      class={tabClass(tab === "books")}
    >
      Books
    </a>
  </div>
);

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const tab = parseFeedTab(c.req.query("tab"));
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
          <div class="mx-auto w-full max-w-[600px] flex flex-col gap-4">
            <PageHeader kicker={kicker} title={title} intro={intro} />
            <FeedTabs tab={tab} />
            <MemberSignInPrompt
              prompt={memberSignInPrompts.feed}
              currentPath={currentPath}
            />
          </div>
        </Page>
      </AppLayout>,
    );
  }

  const [error, result] = await getFollowerFeed(user.id, currentPage, 20, {
    tab,
  });
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
          <PageHeader kicker={kicker} title={title} intro={intro} />
          <FeedTabs tab={tab} />
          <FollowerFeed
            user={user}
            tab={tab}
            currentPath={paginationRequestBaseUrl(c.req.url)}
            items={items}
            totalPages={totalPages}
            page={page}
          />
        </div>
      </Page>
    </AppLayout>,
  );
});
