import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import AuthModal from "../../../../components/app/AuthModal.js";
import {
  deleteWishlist,
  getBookPermissionData,
  insertWishlist
} from "../../../../features/api/services.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import Alert from "../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
import { publishFavouritedActivity } from "../../../../features/api/utils.js";
import { createBookWishlistedNotification } from "../../../../domain/notifications/utils.js";
import { hyperview } from "../../../../lib/hxml.js";
import { findWishlist } from "../../../../db/queries.js";
import { isOk } from "../../../../lib/result.js";
import { getBaseUrl } from "../../../../lib/hyperview.js";
import { getIsHyperview } from "../../../../features/hyperview/lib.js";
import {
  BookFavouritedIcon,
  HyperviewFavoriteInner
} from "../../../../features/hyperview/components/BookActions.js";
import { Behavior, Text, View } from "../../../../lib/hxml-comps.js";
import FavoriteButton from "../../../../features/api/components/FavouriteButton.js";
import FavoritePopoverRow from "../../../../features/api/components/FavoritePopoverRow.js";
import { routeParam } from "../../../../lib/routeParam.js";
import { canWishlistBook } from "../../../../lib/permissions.js";
const updateShelfPage = () => "shelf:updated";
const POST = createRoute(async (c) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview ? postWishlistHyperview(c) : postWishlistWeb(c);
});
const postWishlistHyperview = async (c) => {
  const bookId = routeParam(c, "bookId");
  const user = await getUser(c);
  const baseUrl = getBaseUrl(c);
  const userId = user?.id;
  const hv = hyperview(c);
  const variant = c.req.query("layout") === "block" ? "block" : "compact";
  if (!userId) {
    const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to favorite this book.")}`;
    return hv(
      variant === "block" ? /* @__PURE__ */ jsxs(View, { xmlns: "https://hyperview.org/hyperview", style: "book-action-block", children: [
        /* @__PURE__ */ jsx(Behavior, { trigger: "load", action: "new", verb: "get", href: modalHref }),
        /* @__PURE__ */ jsx(BookFavouritedIcon, { baseUrl, isActive: false }),
        /* @__PURE__ */ jsx(Text, { style: "book-action-label", children: "Favorite" }),
        /* @__PURE__ */ jsx(Behavior, { verb: "get", action: "new", href: modalHref })
      ] }) : /* @__PURE__ */ jsxs(View, { xmlns: "https://hyperview.org/hyperview", children: [
        /* @__PURE__ */ jsx(Behavior, { trigger: "load", action: "new", verb: "get", href: modalHref }),
        /* @__PURE__ */ jsx(BookFavouritedIcon, { baseUrl, isActive: false }),
        /* @__PURE__ */ jsx(Behavior, { verb: "get", action: "new", href: modalHref })
      ] }),
      401
    );
  }
  const [err, book] = await getBookPermissionData(bookId);
  if (err || !book) {
    return hv(
      /* @__PURE__ */ jsx(View, { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(Text, { style: "book-like-muted", children: "?" }) }),
      err ? 400 : 404
    );
  }
  if (!canWishlistBook(user, book))
    return hv(
      /* @__PURE__ */ jsx(View, { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(Text, { style: "book-like-muted", children: "\u2014" }) })
    );
  const isCurrentlyLiked = isOk(await findWishlist(userId, bookId));
  try {
    if (isCurrentlyLiked) {
      await deleteWishlist(user.id, bookId);
    } else {
      await insertWishlist(user.id, bookId);
      publishFavouritedActivity(user, book);
      void createBookWishlistedNotification(user, book);
    }
  } catch (error) {
    console.error("Failed to favorite/unfavorite book", error);
    return hv(/* @__PURE__ */ jsx("text", { style: "book-wishlist-muted", children: "!" }));
  }
  const nowLiked = !isCurrentlyLiked;
  return hv(
    /* @__PURE__ */ jsxs(View, { xmlns: "https://hyperview.org/hyperview", children: [
      /* @__PURE__ */ jsx(
        Behavior,
        {
          trigger: "load",
          action: "dispatch-event",
          "event-name": "books:updated"
        }
      ),
      /* @__PURE__ */ jsx(
        HyperviewFavoriteInner,
        {
          bookId,
          baseUrl,
          isActive: nowLiked,
          variant
        }
      )
    ] })
  );
};
const postWishlistWeb = async (c) => {
  const bookId = routeParam(c, "bookId");
  const user = await getUser(c);
  const userId = user?.id;
  if (!userId)
    return c.html(/* @__PURE__ */ jsx(AuthModal, { action: "to favorite this book." }), 401);
  const [err, book] = await getBookPermissionData(bookId);
  if (err || !book) return showErrorAlert(c, err?.reason ?? "Book not found");
  if (!canWishlistBook(user, book))
    return showErrorAlert(c, "You cannot favorite this book.");
  const body = await c.req.parseBody();
  const isCurrentlyFavorited = body.isFavorited === "true";
  const isCircleButton = body.buttonType === "circle";
  const shouldRefreshWishlist = body.shouldRefreshWishlist === "true";
  const isPopover = body.variant === "popover";
  const isAddingToWishlist = !isCurrentlyFavorited;
  try {
    if (isCurrentlyFavorited) {
      await deleteWishlist(user.id, bookId);
    } else {
      await insertWishlist(user.id, bookId);
      publishFavouritedActivity(user, book);
      void createBookWishlistedNotification(user, book);
    }
  } catch (error) {
    console.error("Failed to favorite/unfavorite book", error);
    return showErrorAlert(c);
  }
  const message = isAddingToWishlist ? `${book.title} favorited` : `${book.title} unfavorited`;
  const nowFavorited = isAddingToWishlist;
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message }),
      isPopover ? /* @__PURE__ */ jsx(
        FavoritePopoverRow,
        {
          bookId,
          isFavorited: nowFavorited,
          isDisabled: !canWishlistBook(user, book)
        }
      ) : /* @__PURE__ */ jsx(
        FavoriteButton,
        {
          book,
          user,
          isCircleButton
        }
      ),
      shouldRefreshWishlist && dispatchEvents([updateShelfPage()])
    ] })
  );
};
export {
  POST
};
