import { createRoute } from "hono-fsr";
import { Context } from "hono";
import {
  getBooksByArtistId,
  getBooksByPublisherId,
} from "../../features/dashboard/books/services";
import { getUser } from "../../utils";
import { getFlash } from "../../utils";
import { getIsMobile } from "../../lib/device";
import InfoPage from "../../pages/InfoPage";
import AppLayout from "../../components/layouts/AppLayout";
import { BooksOverviewTable } from "../../features/dashboard/books/tables/BooksOverviewTable";
import CreatorDashboardShell from "../../features/dashboard/components/CreatorDashboardShell";
import CollectorDashboardShell from "../../features/dashboard/components/CollectorDashboardShell";
import CollectorPostForm from "../../features/collectors/components/CollectorPostForm";
import CollectorPostsTable from "../../features/collectors/components/CollectorPostsTable";
import { getPendingClaim } from "../../features/claims/services";
import CreatorBookFunnelSummary from "../../features/dashboard/books/components/CreatorBookFunnelSummary";
import { isFeatureEnabledForUser } from "../../lib/features";
import PageHeader from "@/components/app/PageHeader";

export const GET = createRoute(async (c: Context) => {
  const searchQuery = c.req.query("search");
  const user = await getUser(c);
  const flash = await getFlash(c);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const currentPath = c.req.path;

  // Collectors (users without a creator profile) get a dashboard for managing
  // their posts, gated behind the collectors flag.
  if (!user.creator) {
    if (!isFeatureEnabledForUser("collectors", user)) {
      return c.html(<InfoPage errorMessage="Creator not found" user={user} />);
    }
    return c.html(
      <AppLayout title="Your Posts" user={user} flash={flash} currentPath={currentPath}>
        <CollectorDashboardShell currentPath={currentPath}>
          <PageHeader
            title="Your Posts"
            intro="Share what's new with the people who follow you."
          />
          <div class="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <CollectorPostForm />
            <div class="xl:col-span-2">
              <CollectorPostsTable userId={user.id} />
            </div>
          </div>
        </CollectorDashboardShell>
      </AppLayout>,
    );
  }

  const creatorId = user.creator.id;
  const creatorType = user.creator.type;
  const isSearching = Boolean(searchQuery?.trim());
  const pageLimit = isSearching ? 30 : 10_000;

  const booksByCreator =
    creatorType === "artist"
      ? getBooksByArtistId(creatorId, currentPage, searchQuery, pageLimit)
      : getBooksByPublisherId(creatorId, currentPage, searchQuery, pageLimit);

  const [[claimError, claim], [error, result]] = await Promise.all([
    getPendingClaim(user.id, creatorId),
    booksByCreator,
  ]);
  if (claimError)
    return c.html(<InfoPage errorMessage={claimError.reason} user={user} />);

  if (error)
    return c.html(<InfoPage errorMessage={error.reason} user={user} />);

  const { books, totalPages, page } = result;

  return c.html(
    <AppLayout
      title="Books Overview"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <CreatorDashboardShell
        currentPath={currentPath}
        user={user}
        claimStatus={claim?.status ?? null}
      >
        <PageHeader
          title="Dashboard"
          intro="Manage your books, posts, and more."
        />
        <CreatorBookFunnelSummary
          creatorId={creatorId}
          creatorType={creatorType}
        />
        <BooksOverviewTable
          books={books}
          isMobile={isMobile}
          creator={user.creator}
          user={user}
          currentPath={currentPath}
          page={page}
          totalPages={totalPages}
          reorderEnabled={!isSearching}
        />
      </CreatorDashboardShell>
    </AppLayout>,
  );
});
