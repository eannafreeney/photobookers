import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import PageHeader from "@/components/app/PageHeader";
import InfoPage from "../../pages/InfoPage";
import MemberDashboardShell from "../../features/dashboard/components/MemberDashboardShell";
import BooksGrid from "../../features/app/components/BooksGrid";
import { getBooksInWishlist } from "../../features/app/services";
import { getPendingClaim } from "../../features/claims/services";
import { getFlash, getUser } from "../../utils";
import { userCanHaveShelf } from "../../domain/shelf/utils";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  if (!userCanHaveShelf(user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const [wishlistError, wishlistResult] = await getBooksInWishlist(
    user.id,
    currentPage,
  );

  if (wishlistError) {
    return c.html(
      <InfoPage errorMessage={wishlistError.reason} user={user} />,
    );
  }

  const claimStatus = user.creator
    ? (await getPendingClaim(user.id, user.creator.id))[1]?.status ?? null
    : null;

  const alpineAttrs = {
    "x-init": true,
    "x-merge": "replace",
    "@shelf:updated.window":
      "$ajax('/dashboard/favorites', { target: 'dashboard-favorites' })",
  };

  return c.html(
    <AppLayout
      title="Favorites"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <MemberDashboardShell
        user={user}
        currentPath={currentPath}
        claimStatus={claimStatus}
      >
        <div
          id="dashboard-favorites"
          class="flex flex-col gap-4"
          {...alpineAttrs}
        >
          <PageHeader
            title="Favorites"
            intro="Books you’ve favorited. Make your shelf public to share them."
          />
          <BooksGrid
            user={user}
            currentPath={currentPath}
            result={
              wishlistResult ?? {
                books: [],
                page: 1,
                totalPages: 1,
              }
            }
            noResultsMessage="Add books to your favorites to see them here."
          />
        </div>
      </MemberDashboardShell>
    </AppLayout>,
  );
});
