import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AuthModal from "../../../../components/app/AuthModal";
import {
  deleteLike,
  findLike,
  getBookPermissionData,
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
import { hyperviewBookLikeInner } from "../../../../features/hyperview/components/BookCard";

const updateLibraryPage = () => "library:updated";

export const POST = createRoute(async (c: Context) => {
  const bookId = c.req.param("bookId");
  const user = await getUser(c);
  const userId = user?.id;
  const hv = hyperview(c);
  const isHyperview = (c.req.header("accept") ?? "").includes(
    "application/vnd.hyperview",
  );

  if (!userId) {
    if (isHyperview) {
      return hv(<text style="book-like-icon-off">♡</text>, 401);
    }
    return c.html(<AuthModal action="to like this book." />, 401);
  }

  const [err, book] = await getBookPermissionData(bookId);
  if (err || !book) {
    if (isHyperview) {
      return hv(<text style="book-like-muted">?</text>, err ? 400 : 404);
    }
    return showErrorAlert(c, err?.reason ?? "Book not found");
  }

  if (!canLikeBook(user, book)) {
    if (isHyperview) {
      return hv(<text style="book-like-muted">—</text>);
    }
    return showErrorAlert(c, "You cannot like this book.");
  }

  let isCurrentlyLiked: boolean;
  let isCircleButton = true;

  if (isHyperview) {
    isCurrentlyLiked = isOk(await findLike(userId, bookId));
  } else {
    const body = await c.req.parseBody();
    isCurrentlyLiked = body.isLiked === "true";
    isCircleButton = body.buttonType === "circle";
  }

  try {
    if (isCurrentlyLiked) {
      await deleteLike(userId, bookId);
    } else {
      await insertLike(userId, bookId);
      publishLikeActivity(user, book);
      createBookLikedNotification(user, book);
    }
  } catch (error) {
    console.error("Failed to add/remove book like", error);
    if (isHyperview) {
      return hv(<text style="book-like-muted">!</text>);
    }
    return showErrorAlert(c);
  }

  if (isHyperview) {
    const nowLiked = isOk(await findLike(userId, bookId));
    const baseUrl = getBaseUrl(c);
    return hv(hyperviewBookLikeInner(bookId, baseUrl, nowLiked));
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
});
