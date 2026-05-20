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
import { hyperview } from "../../../../lib/hxml";
import { findWishlist } from "../../../../db/queries";
import { isOk } from "../../../../lib/result";
import { getBaseUrl } from "../../../../lib/hyperview";
import { getIsHyperview } from "../../../../features/hyperview/lib";
import { HyperviewBookWishlistInner } from "../../../../features/hyperview/components/BookActions";
import { Behavior, Text, View } from "../../../../lib/hxml-comps";
import { canWishlistBook } from "../../../../lib/permissions";

const updateLibraryPage = () => "library:updated";

export const POST = createRoute(async (c: Context) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview ? postWishlistHyperview(c) : postWishlistWeb(c);
});

const postWishlistHyperview = async (c: Context) => {
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
        <Text style="book-wishlist-icon-off">♡</Text>
        <Behavior trigger="press" verb="get" action="new" href={modalHref} />
      </View>,
      401,
    );
  }

  const [err, book] = await getBookPermissionData(bookId);

  if (err || !book) {
    return hv(
      <View xmlns="https://hyperview.org/hyperview">
        <Text style="book-like-muted">?</Text>
      </View>,
      err ? 400 : 404,
    );
  }

  if (!canWishlistBook(user, book))
    return hv(
      <View xmlns="https://hyperview.org/hyperview">
        <Text style="book-like-muted">—</Text>
      </View>,
    );

  const isCurrentlyLiked = isOk(await findWishlist(userId, bookId));

  try {
    if (isCurrentlyLiked) {
      await deleteWishlist(user.id, bookId);
    } else {
      await insertWishlist(user.id, bookId);
      publishWishlistActivity(user, book);
      void createBookWishlistedNotification(user, book);
    }
  } catch (error) {
    console.error("Failed to like/unlike book", error);
    return hv(<text style="book-wishlist-muted">!</text>);
  }

  const nowLiked = !isCurrentlyLiked;

  return hv(
    <View xmlns="https://hyperview.org/hyperview">
      <Behavior
        trigger="load"
        action="dispatch-event"
        event-name="books:updated"
      />
      <HyperviewBookWishlistInner
        bookId={bookId}
        baseUrl={baseUrl}
        isActive={nowLiked}
      />
    </View>,
  );
};

const postWishlistWeb = async (c: Context) => {
  const bookId = c.req.param("bookId");
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId) return c.html(<AuthModal action="to like this book." />, 401);

  const [err, book] = await getBookPermissionData(bookId);
  if (err || !book) return showErrorAlert(c, err?.reason ?? "Book not found");

  if (!canWishlistBook(user, book))
    return showErrorAlert(c, "You cannot like this book.");

  const body = await c.req.parseBody();
  const isCurrentlyWishlisted = body.isWishlisted === "true";
  const isCircleButton = body.buttonType === "circle";
  const shouldRefreshWishlist = body.shouldRefreshWishlist === "true";

  const isAddingToWishlist = !isCurrentlyWishlisted;

  try {
    if (isCurrentlyWishlisted) {
      await deleteWishlist(user.id, bookId);
    } else {
      await insertWishlist(user.id, bookId);
      publishWishlistActivity(user, book);
      void createBookWishlistedNotification(user, book);
    }
  } catch (error) {
    console.error("Failed to add/remove book to wishlist", error);

    return showErrorAlert(c);
  }

  const message = isAddingToWishlist
    ? `${book.title} liked`
    : `${book.title} unliked`;

  return c.html(
    <>
      <Alert type="success" message={message} />
      <WishlistButton book={book} user={user} isCircleButton={isCircleButton} />
      {shouldRefreshWishlist && dispatchEvents([updateLibraryPage()])}
    </>,
  );
};
