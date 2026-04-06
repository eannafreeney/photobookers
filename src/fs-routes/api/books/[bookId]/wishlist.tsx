import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AuthModal from "../../../../components/app/AuthModal";
import {
  deleteWishlist,
  getBookPermissionData,
  insertWishlist,
} from "../../../../features/api/services";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import Alert from "../../../../components/app/Alert";
import WishlistButton from "../../../../features/api/components/WishlistButton";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import { publishWishlistActivity } from "../../../../features/api/utils";
import { createBookWishlistedNotification } from "../../../../features/dashboard/admin/notifications/utils";
import { Context } from "hono";

const updateLibraryPage = () => "library:updated";

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);
  if (!user?.id)
    return c.html(<AuthModal action="to wishlist this book." />, 401);

  const bookId = c.req.param("bookId");
  const body = await c.req.parseBody();

  const isWishlisted = body.isWishlisted === "true";
  const isCircleButton = body.buttonType === "circle";
  const shouldRefreshWishlist = body.shouldRefreshWishlist === "true";
  const isAddingToWishlist = !isWishlisted;

  const [err, book] = await getBookPermissionData(bookId);
  if (err || !book) return showErrorAlert(c, err?.reason ?? "Book not found");

  try {
    if (isAddingToWishlist) {
      await insertWishlist(user.id, bookId);
      publishWishlistActivity(user, book);
      await createBookWishlistedNotification(user, book);
    } else {
      await deleteWishlist(user.id, bookId);
    }
  } catch (error) {
    console.error("Failed to add/remove book to wishlist", error);
    return showErrorAlert(c);
  }

  const message = isAddingToWishlist
    ? `${book.title} has been added to your wishlist`
    : `${book.title} has been removed from your wishlist`;

  return c.html(
    <>
      <Alert type="success" message={message} />
      <WishlistButton book={book} user={user} isCircleButton={isCircleButton} />
      {shouldRefreshWishlist && dispatchEvents([updateLibraryPage()])}
    </>,
  );
});
