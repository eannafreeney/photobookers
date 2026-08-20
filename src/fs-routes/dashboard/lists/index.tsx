import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../components/layouts/AppLayout";
import PageHeader from "@/components/app/PageHeader";
import InfoPage from "../../../pages/InfoPage";
import { getPendingClaim } from "../../../features/claims/services";
import { getFlash, getUser } from "../../../utils";
import {
  createBookList,
  listBookListsWithCounts,
} from "../../../domain/lists/services";
import { userCanManageBookLists } from "../../../domain/lists/utils";
import ListsDashboardShell from "../../../features/dashboard/lists/ListsDashboardShell";
import ListsTable from "../../../features/dashboard/lists/ListsTable";
import ListForm from "../../../features/dashboard/lists/ListForm";
import { showErrorAlert } from "../../../lib/alertHelpers";
import { dispatchEvents } from "../../../lib/disatchEvents";
import Alert from "../../../components/app/Alert";
import Banner from "../../../components/app/Banner";
import Link from "../../../components/app/Link";
import { getIsMobile } from "../../../lib/device";
import { formatShelfOwnerName } from "../../../domain/shelf/utils";

function canAccessLists(user: Awaited<ReturnType<typeof getUser>>) {
  return userCanManageBookLists(user);
}

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;

  if (!canAccessLists(user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const [listsErr, listRows] = await listBookListsWithCounts(user.id);
  if (listsErr || !listRows) {
    return c.html(
      <InfoPage
        errorMessage={listsErr?.reason ?? "Failed to load lists"}
        user={user}
      />,
    );
  }

  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const canPublishOnShelf = Boolean(user.shelfPublic && user.shelfSlug);
  const claimStatus = user.creator
    ? ((await getPendingClaim(user.id, user.creator.id))[1]?.status ?? null)
    : null;

  return c.html(
    <AppLayout
      title="Your lists"
      user={user}
      flash={flash}
      currentPath={currentPath}
      noIndex
    >
      <ListsDashboardShell
        user={user}
        currentPath={currentPath}
        claimStatus={claimStatus}
      >
        <PageHeader
          title="Your lists"
          intro="Create playlist-style lists of books. Publish them on your public shelf."
        />
        {!canPublishOnShelf ? (
          <Banner
            type="info"
            message="Lists are disabled while your shelf is private. Make your shelf public to share lists with people who follow you."
          >
            <Link href="/dashboard/shelf" className="text-sm text-accent">
              Manage shelf settings
            </Link>
          </Banner>
        ) : null}
        <div class="grid grid-cols-1 gap-8 xl:grid-cols-3 xl:items-start">
          <div class="bg-surface-alt p-4 rounded-md xl:sticky xl:top-24">
            <h2 class="mb-3 text-lg font-semibold text-on-surface-strong">
              Create New list
            </h2>
            <ListForm disabled={!canPublishOnShelf} />
          </div>
          <div class="xl:col-span-2">
            <ListsTable
              lists={listRows}
              ownerName={formatShelfOwnerName({
                firstName: user.firstName,
                lastName: user.lastName,
              })}
              shelfSlug={user.shelfSlug}
              shelfPublic={user.shelfPublic}
              isMobile={isMobile}
            />
          </div>
        </div>
      </ListsDashboardShell>
    </AppLayout>,
  );
});

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);
  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't create lists right now.");
  }

  if (!user.shelfPublic || !user.shelfSlug) {
    return showErrorAlert(
      c,
      "Make your shelf public before creating lists. Open Dashboard → Shelf.",
    );
  }

  const body = await c.req.parseBody();
  const [err, list] = await createBookList(user.id, {
    title: String(body.title ?? ""),
    description: String(body.description ?? ""),
  });

  if (err || !list) {
    return showErrorAlert(c, err?.reason ?? "Failed to create list");
  }

  return c.html(
    <>
      <Alert type="success" message={`"${list.title}" created.`} />
      {dispatchEvents(["lists:updated"])}
    </>,
  );
});
