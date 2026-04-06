import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AuthModal from "../../../../components/app/AuthModal";
import {
  deleteLike,
  getBookPermissionData,
  insertLike,
} from "../../../../features/api/services";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { publishLikeActivity } from "../../../../features/api/utils";
import { createBookLikedNotification } from "../../../../features/dashboard/admin/notifications/utils";
import Alert from "../../../../components/app/Alert";
import LikeButton from "../../../../features/api/components/LikeButton";
import { dispatchEvents } from "../../../../lib/disatchEvents";

const updateLibraryPage = () => "library:updated";

export const POST = createRoute(async (c: Context) => {
  const bookId = c.req.param("bookId");
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId) return c.html(<AuthModal action="to like this book." />, 401);

  const body = await c.req.parseBody();
  const isCurrentlyLiked = body.isLiked === "true";
  const isCircleButton = body.buttonType === "circle";

  const [err, book] = await getBookPermissionData(bookId);
  if (err || !book) return showErrorAlert(c, err?.reason ?? "Book not found");

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
});
