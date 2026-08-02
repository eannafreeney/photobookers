import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../components/layouts/AppLayout";
import PageHeader from "@/components/app/PageHeader";
import InfoPage from "../../../pages/InfoPage";
import { getFlash, getUser } from "../../../utils";
import { isFeatureEnabledForUser } from "../../../lib/features";
import {
  deleteBookList,
  getBookListForOwner,
  getBooksInList,
  updateBookList,
} from "../../../domain/lists/services";
import { userCanManageBookLists } from "../../../domain/lists/utils";
import ListsDashboardShell from "../../../features/dashboard/lists/ListsDashboardShell";
import ListForm from "../../../features/dashboard/lists/ListForm";
import ListBooksEditor from "../../../features/dashboard/lists/ListBooksEditor";
import { showErrorAlert } from "../../../lib/alertHelpers";
import Alert from "../../../components/app/Alert";
import { routeParam } from "../../../lib/routeParam";
import Link from "../../../components/app/Link";
import { getPendingClaim } from "../../../features/claims/services";

function canAccessLists(user: Awaited<ReturnType<typeof getUser>>) {
  return (
    userCanManageBookLists(user) &&
    isFeatureEnabledForUser("collectors", user)
  );
}

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const listId = routeParam(c, "listId");

  if (!canAccessLists(user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const [err, list] = await getBookListForOwner(listId, user.id);
  if (err || !list) {
    return c.html(
      <InfoPage errorMessage={err?.reason ?? "List not found"} user={user} />,
      404,
    );
  }

  const [booksErr, booksResult] = await getBooksInList(listId, 1, "newest", 100);
  if (booksErr || !booksResult) {
    return c.html(
      <InfoPage
        errorMessage={booksErr?.reason ?? "Failed to load books"}
        user={user}
      />,
    );
  }

  const publicUrl =
    user.shelfPublic && user.shelfSlug && list.isPublic
      ? `/shelf/${user.shelfSlug}/lists/${list.slug}`
      : null;

  const claimStatus = user.creator
    ? (await getPendingClaim(user.id, user.creator.id))[1]?.status ?? null
    : null;

  return c.html(
    <AppLayout
      title={list.title}
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
        <div class="mb-2">
          <Link href="/dashboard/lists" className="text-sm text-accent">
            ← All lists
          </Link>
        </div>
        <PageHeader
          title={list.title}
          intro="Edit details, publish, or remove books from this list."
        />
        {publicUrl ? (
          <p class="text-sm text-on-surface">
            Public page:{" "}
            <a
              href={publicUrl}
              class="text-accent underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              {publicUrl}
            </a>
          </p>
        ) : null}
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 class="mb-3 text-lg font-semibold text-on-surface-strong">
              Details
            </h2>
            <ListForm list={list} />
            <form
              method="post"
              action={`/dashboard/lists/${list.id}`}
              class="mt-6"
              x-data="{ isSubmitting: false }"
              {...{
                "@submit":
                  "if (!confirm('Delete this list?')) { $event.preventDefault(); return }; isSubmitting = true",
              }}
            >
              <input type="hidden" name="_method" value="DELETE" />
              <button
                type="submit"
                class="text-sm text-error hover:underline"
                x-bind:disabled="isSubmitting"
              >
                Delete list
              </button>
            </form>
          </div>
          <div>
            <h2 class="mb-3 text-lg font-semibold text-on-surface-strong">
              Books
            </h2>
            <ListBooksEditor listId={list.id} books={booksResult.books} />
          </div>
        </div>
      </ListsDashboardShell>
    </AppLayout>,
  );
});

export const PATCH = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");

  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't edit lists right now.");
  }

  const body = await c.req.parseBody();
  const [err, list] = await updateBookList(listId, user.id, {
    title: String(body.title ?? ""),
    description: String(body.description ?? ""),
    slug: String(body.slug ?? ""),
    isPublic: body.isPublic === "true",
  });

  if (err || !list) {
    return showErrorAlert(c, err?.reason ?? "Failed to update list");
  }

  return c.html(
    <>
      <Alert type="success" message="List saved." />
      <ListForm list={list} />
    </>,
  );
});

export const DELETE = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");

  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't delete lists right now.");
  }

  const [err] = await deleteBookList(listId, user.id);
  if (err) return showErrorAlert(c, err.reason);

  return c.redirect("/dashboard/lists");
});
