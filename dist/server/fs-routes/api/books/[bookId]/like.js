import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import AuthModal from "../../../../components/app/AuthModal.js";
import {
  deleteLike,
  findLike,
  getBookLikeContext,
  insertLike
} from "../../../../features/api/services.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import { publishLikeActivity } from "../../../../features/api/utils.js";
import { createBookLikedNotification } from "../../../../domain/notifications/utils.js";
import Alert from "../../../../components/app/Alert.js";
import LikeButton from "../../../../features/api/components/LikeButton.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
import { hyperview } from "../../../../lib/hxml.js";
import { getBaseUrl } from "../../../../lib/hyperview.js";
import { canLikeBook } from "../../../../lib/permissions.js";
import { isOk } from "../../../../lib/result.js";
import { getIsHyperview } from "../../../../features/hyperview/lib.js";
import { Behavior, Text, View } from "../../../../lib/hxml-comps.js";
import { routeParam } from "../../../../lib/routeParam.js";
const updateLibraryPage = () => "library:updated";
const POST = createRoute(async (c) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview ? postLikeHyperview(c) : postLikeWeb(c);
});
const postLikeHyperview = async (c) => {
  const bookId = routeParam(c, "bookId");
  const user = await getUser(c);
  const baseUrl = getBaseUrl(c);
  const userId = user?.id;
  const hv = hyperview(c);
  if (!userId) {
    const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to like this book.")}`;
    return hv(
      /* @__PURE__ */ jsxs(View, { xmlns: "https://hyperview.org/hyperview", children: [
        /* @__PURE__ */ jsx(Behavior, { trigger: "load", action: "new", verb: "get", href: modalHref }),
        /* @__PURE__ */ jsx(Text, { style: "book-like-icon-off", children: "\u2606" }),
        /* @__PURE__ */ jsx(Behavior, { verb: "get", action: "new", href: modalHref })
      ] }),
      401
    );
  }
  const [err, book] = await getBookLikeContext(bookId);
  if (err || !book)
    return hv(
      /* @__PURE__ */ jsx(View, { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(Text, { style: "book-like-muted", children: "?" }) }),
      err ? 400 : 404
    );
  if (!canLikeBook(user, book))
    return hv(
      /* @__PURE__ */ jsx(View, { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(Text, { style: "book-like-muted", children: "\u2014" }) })
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
      /* @__PURE__ */ jsx(View, { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(Text, { style: "book-like-muted", children: "!" }) })
    );
  }
  const nowLiked = !isCurrentlyLiked;
  return hv(
    /* @__PURE__ */ jsx(View, { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(
      Behavior,
      {
        trigger: "load",
        action: "dispatch-event",
        "event-name": "books:updated"
      }
    ) })
  );
};
const postLikeWeb = async (c) => {
  const bookId = routeParam(c, "bookId");
  const user = await getUser(c);
  const userId = user?.id;
  if (!userId) return c.html(/* @__PURE__ */ jsx(AuthModal, { action: "to like this book." }), 401);
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
  const message = isCurrentlyLiked ? `${book.title} has been unliked` : `${book.title} has been liked`;
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message }),
      /* @__PURE__ */ jsx(LikeButton, { book, user, isCircleButton }),
      dispatchEvents([updateLibraryPage()])
    ] })
  );
};
export {
  POST
};
