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
import { dispatchEvents } from "../../../../lib/disatchEvents";
import { publishWishlistActivity } from "../../../../features/api/utils";
import { createBookWishlistedNotification } from "../../../../features/dashboard/admin/notifications/utils";
import { Context } from "hono";
import { hyperview } from "../../../../lib/hxml";
import { findWishlist } from "../../../../db/queries";
import { isOk } from "../../../../lib/result";
import { getBaseUrl } from "../../../../lib/hyperview";
import { getIsHyperview } from "../../../../features/hyperview/lib";
import {
  BookWishlistIcon,
  HyperviewFavoriteInner,
} from "../../../../features/hyperview/components/BookActions";
import { Behavior, Text, View } from "../../../../lib/hxml-comps";
import { canWishlistBook } from "../../../../lib/permissions";
import FavoriteButton from "../../../../features/api/components/WishlistButton";

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
  const variant =
    c.req.query("layout") === "block"
      ? ("block" as const)
      : ("compact" as const);

  if (!userId) {
    const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to favorite this book.")}`;
    return hv(
      variant === "block" ? (
        <View xmlns="https://hyperview.org/hyperview" style="book-action-block">
          <Behavior trigger="load" action="new" verb="get" href={modalHref} />
          <BookWishlistIcon baseUrl={baseUrl} isActive={false} />
          <Text style="book-action-label">Favorite</Text>
          <Behavior trigger="press" verb="get" action="new" href={modalHref} />
        </View>
      ) : (
        <View xmlns="https://hyperview.org/hyperview">
          <Behavior trigger="load" action="new" verb="get" href={modalHref} />
          <BookWishlistIcon baseUrl={baseUrl} isActive={false} />
          <Behavior trigger="press" verb="get" action="new" href={modalHref} />
        </View>
      ),
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
    console.error("Failed to favorite/unfavorite book", error);
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
      <HyperviewFavoriteInner
        bookId={bookId}
        baseUrl={baseUrl}
        isActive={nowLiked}
        variant={variant}
      />
    </View>,
  );
};

const postWishlistWeb = async (c: Context) => {
  const bookId = c.req.param("bookId");
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId)
    return c.html(<AuthModal action="to favorite this book." />, 401);

  const [err, book] = await getBookPermissionData(bookId);
  if (err || !book) return showErrorAlert(c, err?.reason ?? "Book not found");

  if (!canWishlistBook(user, book))
    return showErrorAlert(c, "You cannot favorite this book.");

  const body = await c.req.parseBody();
  const isCurrentlyFavorited = body.isFavorited === "true";
  const isCircleButton = body.buttonType === "circle";
  const shouldRefreshWishlist = body.shouldRefreshWishlist === "true";

  const isAddingToWishlist = !isCurrentlyFavorited;

  try {
    if (isCurrentlyFavorited) {
      await deleteWishlist(user.id, bookId);
    } else {
      await insertWishlist(user.id, bookId);
      publishWishlistActivity(user, book);
      void createBookWishlistedNotification(user, book);
    }
  } catch (error) {
    console.error("Failed to favorite/unfavorite book", error);

    return showErrorAlert(c);
  }

  const message = isAddingToWishlist
    ? `${book.title} favorited`
    : `${book.title} unfavorited`;

  return c.html(
    <>
      <Alert type="success" message={message} />
      <FavoriteButton book={book} user={user} isCircleButton={isCircleButton} />
      {shouldRefreshWishlist && dispatchEvents([updateLibraryPage()])}
    </>,
  );
};
