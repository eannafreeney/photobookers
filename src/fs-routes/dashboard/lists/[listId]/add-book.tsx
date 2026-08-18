import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../../../utils";
import {
  addBookToList,
  getBookListForOwner,
  getBooksInList,
  searchBooksForList,
} from "../../../../domain/lists/services";
import { userCanManageBookLists } from "../../../../domain/lists/utils";
import ListBooksEditor from "../../../../features/dashboard/lists/ListBooks";
import { ListBookSearchResults } from "../../../../features/dashboard/lists/ListBookSearch";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import Alert from "../../../../components/app/Alert";
import { routeParam } from "../../../../lib/routeParam";

function canAccessLists(user: Awaited<ReturnType<typeof getUser>>) {
  return userCanManageBookLists(user);
}

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");
  const query = c.req.query("q") ?? "";

  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't edit lists right now.");
  }

  const [ownerErr] = await getBookListForOwner(listId, user.id);
  if (ownerErr) return showErrorAlert(c, ownerErr.reason);

  const [searchErr, results] = await searchBooksForList(listId, query);
  if (searchErr || !results) {
    return showErrorAlert(c, searchErr?.reason ?? "Failed to search books");
  }

  return c.html(
    <ListBookSearchResults listId={listId} query={query} results={results} />,
  );
});

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");

  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't edit lists right now.");
  }

  const body = await c.req.parseBody();
  const bookId = String(body.bookId ?? "");
  const query = String(body.q ?? "");

  if (!bookId) return showErrorAlert(c, "Choose a book to add.");

  const [addErr] = await addBookToList(listId, bookId, user.id);
  if (addErr) return showErrorAlert(c, addErr.reason);

  const [booksErr, booksResult] = await getBooksInList(
    listId,
    1,
    "newest",
    100,
  );
  if (booksErr || !booksResult) {
    return showErrorAlert(c, booksErr?.reason ?? "Failed to reload books");
  }

  const [searchErr, results] = await searchBooksForList(listId, query);
  if (searchErr || !results) {
    return showErrorAlert(c, searchErr?.reason ?? "Failed to search books");
  }

  return c.html(
    <>
      <Alert type="success" message="Book added." />
      <ListBooksEditor listId={listId} books={booksResult.books} />
      <ListBookSearchResults listId={listId} query={query} results={results} />
    </>,
  );
});
