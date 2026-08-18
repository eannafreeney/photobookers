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
import { getIsMobile } from "../../../lib/device";

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

  const lists = await listBookListsWithCounts(user.id);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
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
        <div class="grid grid-cols-1 gap-8 xl:grid-cols-3 xl:items-start">
          <div class="bg-surface-alt p-4 rounded-md xl:sticky xl:top-24">
            <h2 class="mb-3 text-lg font-semibold text-on-surface-strong">
              Create New list
            </h2>
            <ListForm />
          </div>
          <div class="xl:col-span-2">
            <ListsTable
              lists={lists}
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
