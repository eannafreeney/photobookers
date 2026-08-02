import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import BooksGrid from "../../features/app/components/BooksGrid";
import MemberSignInPrompt, {
  memberSignInPrompts,
} from "../../features/app/components/MemberSignInPrompt";
import PrivateShelfListsStrip from "../../features/app/components/PrivateShelfListsStrip";
import { getBooksInWishlist } from "../../features/app/services";
import { userCanHaveShelf } from "../../domain/shelf/utils";
import { listBookListsWithCounts } from "../../domain/lists/services";
import InfoPage from "../../pages/InfoPage";
import PageHeader from "../../components/app/PageHeader";
import Link from "../../components/app/Link";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  if (!user) {
    return c.html(
      <AppLayout
        title="Shelf"
        user={user}
        flash={flash}
        currentPath={currentPath}
        noIndex
      >
        <Page>
          <div class="flex flex-col gap-4">
            <PageHeader
              kicker="Your Shelf"
              title="Shelf"
              intro="The books you’ve favorited, all in one place."
            />
            <MemberSignInPrompt
              prompt={memberSignInPrompts.shelf}
              currentPath={currentPath}
            />
          </div>
        </Page>
      </AppLayout>,
    );
  }

  if (!userCanHaveShelf(user)) {
    return c.html(
      <InfoPage errorMessage="Not found" user={user} />,
      404,
    );
  }

  const [wishlistError, wishlistResult] = await getBooksInWishlist(
    user.id,
    currentPage,
  );

  if (wishlistError) {
    return c.html(
      <InfoPage errorMessage={wishlistError?.reason} user={user} />,
    );
  }

  if (!wishlistResult?.books) {
    return c.html(
      <InfoPage errorMessage="No favourited books found" user={user} />,
    );
  }

  const lists = await listBookListsWithCounts(user.id);

  const alpineAttrs = {
    "x-init": true,
    "x-merge": "replace",
    "@shelf:updated.window":
      "$ajax('/shelf', { target: 'shelf-container' })",
  };

  return c.html(
    <AppLayout
      title="Shelf"
      user={user}
      flash={flash}
      currentPath={currentPath}
      noIndex
    >
      <Page>
        <div
          id="shelf-container"
          class="flex flex-col gap-4"
          {...alpineAttrs}
        >
          <PageHeader
            kicker="Your Shelf"
            title="Shelf"
            intro="The books you’ve favorited, all in one place."
          />
          <p class="text-sm text-on-surface">
            Manage sharing settings in your{" "}
            <Link href="/dashboard/shelf">dashboard</Link>.
          </p>
          <PrivateShelfListsStrip
            lists={lists}
            shelfSlug={user.shelfSlug}
            shelfPublic={user.shelfPublic}
          />
          <BooksGrid
            user={user}
            currentPath={currentPath}
            result={wishlistResult}
            noResultsMessage="Add books to your favorites to see them here."
          />
        </div>
      </Page>
    </AppLayout>,
  );
});
