import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../components/layouts/AppLayout";
import PageHeader from "@/components/app/PageHeader";
import InfoPage from "../../../pages/InfoPage";
import { getFlash, getUser } from "../../../utils";
import {
  deleteBookList,
  getBookListForOwner,
  getBooksInList,
  updateBookList,
} from "../../../domain/lists/services";
import { userCanManageBookLists } from "../../../domain/lists/utils";
import { parseCheckboxField } from "../../../schemas";
import ListsDashboardShell from "../../../features/dashboard/lists/ListsDashboardShell";
import ListForm from "../../../features/dashboard/lists/ListForm";
import ListBooks from "@/features/dashboard/lists/ListBooks";
import ListBookSearch from "../../../features/dashboard/lists/ListBookSearch";
import { showErrorAlert } from "../../../lib/alertHelpers";
import Alert from "../../../components/app/Alert";
import { routeParam } from "../../../lib/routeParam";
import Link from "../../../components/app/Link";
import { getPendingClaim } from "../../../features/claims/services";
import ListVisibilityToggle from "../../../features/dashboard/lists/ListVisibilityToggle";
import { dispatchEvents } from "../../../lib/disatchEvents";

function canAccessLists(user: Awaited<ReturnType<typeof getUser>>) {
  return userCanManageBookLists(user);
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

  const [booksErr, booksResult] = await getBooksInList(
    listId,
    1,
    "newest",
    100,
  );
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
    ? ((await getPendingClaim(user.id, user.creator.id))[1]?.status ?? null)
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
        <div class="grid grid-cols-1 gap-8 xl:grid-cols-3 xl:items-start">
          <div class="bg-surface-alt p-6 rounded-lg xl:sticky xl:top-24">
            <h2 class="mb-3 text-lg font-semibold text-on-surface-strong">
              Edit List Details
            </h2>
            <ListForm
              listId={list.id}
              formValues={{
                title: list.title,
                description: list.description ?? "",
                slug: list.slug,
                isPublic: list.isPublic,
              }}
            />
          </div>
          <div class="flex flex-col gap-8 xl:col-span-2">
            <div>
              <h2 class="text-lg font-semibold text-on-surface-strong mb-2">
                Add books
              </h2>
              <ListBookSearch listId={list.id} />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-on-surface-strong mb-2">
                In this list
              </h2>
              <ListBooks listId={list.id} books={booksResult.books} />
            </div>
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
  const intent = String(body.intent ?? "");

  if (intent === "make-public" || intent === "make-private") {
    const [err, list] = await updateBookList(listId, user.id, {
      isPublic: intent === "make-public",
    });

    if (err || !list) {
      return showErrorAlert(c, err?.reason ?? "Failed to update list");
    }

    return c.html(
      <>
        <Alert
          type="success"
          message={`"${list.title}" is now ${list.isPublic ? "public" : "private"}.`}
        />
        <ListVisibilityToggle list={list} />
        {dispatchEvents(["lists:updated"])}
      </>,
    );
  }

  const [err, list] = await updateBookList(listId, user.id, {
    title: String(body.title ?? ""),
    description: String(body.description ?? ""),
    slug: String(body.slug ?? ""),
    isPublic: parseCheckboxField(body.isPublic),
  });

  if (err || !list) {
    return showErrorAlert(c, err?.reason ?? "Failed to update list");
  }

  return c.html(
    <>
      <Alert type="success" message="List saved." />
      <ListForm
        listId={list.id}
        formValues={{
          title: list.title,
          description: list.description ?? "",
          slug: list.slug,
          isPublic: list.isPublic,
        }}
      />
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

  if (c.req.header("X-Alpine-Request") === "true") {
    return c.html(
      <>
        <Alert type="success" message="List deleted." />
        {dispatchEvents(["lists:updated"])}
      </>,
    );
  }

  return c.redirect("/dashboard/lists");
});
