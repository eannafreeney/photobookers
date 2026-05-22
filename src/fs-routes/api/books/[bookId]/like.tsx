import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AuthModal from "../../../../components/app/AuthModal";
import {
  deleteLike,
  findLike,
  getBookLikeContext,
  insertLike,
} from "../../../../features/api/services";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { publishLikeActivity } from "../../../../features/api/utils";
import { createBookLikedNotification } from "../../../../features/dashboard/admin/notifications/utils";
import Alert from "../../../../components/app/Alert";
import LikeButton from "../../../../features/api/components/LikeButton";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import { hyperview } from "../../../../lib/hxml";
import { getBaseUrl } from "../../../../lib/hyperview";
import { canLikeBook } from "../../../../lib/permissions";
import { isOk } from "../../../../lib/result";
// import { HyperviewBookLikeInner } from "../../../../features/hyperview/components/BookActions";
import { getIsHyperview } from "../../../../features/hyperview/lib";
import { Behavior, Text, View } from "../../../../lib/hxml-comps";

const updateLibraryPage = () => "library:updated";

export const POST = createRoute(async (c: Context) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview ? postLikeHyperview(c) : postLikeWeb(c);
});

const postLikeHyperview = async (c: Context) => {
  const bookId = c.req.param("bookId");
  const user = await getUser(c);
  const baseUrl = getBaseUrl(c);
  const userId = user?.id;
  const hv = hyperview(c);

  if (!userId) {
    const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to like this book.")}`;
    return hv(
      <View xmlns="https://hyperview.org/hyperview">
        <Behavior trigger="load" action="new" verb="get" href={modalHref} />
        <Text style="book-like-icon-off">☆</Text>
        <Behavior verb="get" action="new" href={modalHref} />
      </View>,
      401,
    );
  }

  const [err, book] = await getBookLikeContext(bookId);

  if (err || !book)
    return hv(
      <View xmlns="https://hyperview.org/hyperview">
        <Text style="book-like-muted">?</Text>
      </View>,
      err ? 400 : 404,
    );

  if (!canLikeBook(user, book))
    return hv(
      <View xmlns="https://hyperview.org/hyperview">
        <Text style="book-like-muted">—</Text>
      </View>,
    );

  const isCurrentlyLiked = isOk(await findLike(userId, bookId));

  try {
    if (isCurrentlyLiked) {
      await deleteLike(userId, bookId);
    } else {
      await insertLike(userId, bookId);
      publishLikeActivity(user, book);
      void createBookLikedNotification(user, book);
    }
  } catch (error) {
    console.error("Failed to add/remove book like", error);
    return hv(
      <View xmlns="https://hyperview.org/hyperview">
        <Text style="book-like-muted">!</Text>
      </View>,
    );
  }

  const nowLiked = !isCurrentlyLiked;
  return hv(
    <View xmlns="https://hyperview.org/hyperview">
      <Behavior
        trigger="load"
        action="dispatch-event"
        event-name="books:updated"
      />
      {/* <HyperviewBookLikeInner
        bookId={bookId}
        baseUrl={baseUrl}
        isActive={nowLiked}
      /> */}
    </View>,
  );
};

const postLikeWeb = async (c: Context) => {
  const bookId = c.req.param("bookId");
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId) return c.html(<AuthModal action="to like this book." />, 401);

  const [err, book] = await getBookLikeContext(bookId);
  if (err || !book) return showErrorAlert(c, err?.reason ?? "Book not found");

  if (!canLikeBook(user, book))
    return showErrorAlert(c, "You cannot like this book.");

  const body = await c.req.parseBody();
  const isCurrentlyLiked = body.isLiked === "true";
  const isCircleButton = body.buttonType === "circle";

  try {
    if (isCurrentlyLiked) {
      await deleteLike(userId, bookId);
    } else {
      await insertLike(userId, bookId);
      publishLikeActivity(user, book);
      void createBookLikedNotification(user, book);
    }
  } catch (error) {
    console.error("Failed to add/remove book like", error);

    return showErrorAlert(c);
  }

  const message = isCurrentlyLiked
    ? `${book.title} has been unliked`
    : `${book.title} has been liked`;

  return c.html(
    <>
      <Alert type="success" message={message} />
      <LikeButton book={book} user={user} isCircleButton={isCircleButton} />
      {dispatchEvents([updateLibraryPage()])}
    </>,
  );
};
