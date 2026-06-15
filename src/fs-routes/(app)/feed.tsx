import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import { getFeedBooks } from "../../features/app/services";
import Page from "../../components/layouts/Page";
import InfoPage from "../../pages/InfoPage";
import MemberSignInPrompt, {
  memberSignInPrompts,
} from "../../features/app/components/MemberSignInPrompt";
import { Context } from "hono";
import BooksGrid from "../../features/app/components/BooksGrid";
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
          <PageHeader
            kicker="Your Feed"
            title="From Creators You Follow"
            intro="The latest books from the artists and publishers you follow."
          />
          <MemberSignInPrompt
            prompt={memberSignInPrompts.feed}
            currentPath={currentPath}
          />
        </Page>
      </AppLayout>,
    );
  }

  const [error, result] = await getFeedBooks(user.id, currentPage);
  if (error) {
    return c.html(<InfoPage errorMessage={error.reason} user={user} />);
  }

  if (!result?.books) {
    return c.html(
      <InfoPage errorMessage="No books found by your followees" user={user} />,
    );
  }

  return c.html(
    <AppLayout
      title="Books"
      user={user}
      flash={flash}
      currentPath={currentPath}
      noIndex
    >
      <Page>
        <PageHeader
          kicker="Your Feed"
          title="From Creators You Follow"
          intro="The latest books from the artists and publishers you follow."
        />
        <BooksGrid
          user={user}
          currentPath={currentPath}
          result={result}
          noResultsMessage="Start following artists and publishers to see their latest releases here."
        />
      </Page>
    </AppLayout>,
  );
});
