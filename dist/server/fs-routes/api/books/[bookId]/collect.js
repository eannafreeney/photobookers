import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import AuthModal from "../../../../components/app/AuthModal.js";
import { getBookPermissionData } from "../../../../features/api/services.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import { publishCollectActivity } from "../../../../features/api/utils.js";
import { createBookCollectedNotification } from "../../../../domain/notifications/utils.js";
import Alert from "../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
import {
  deleteCollectionItem,
  findCollectionItem,
  insertCollectionItem
} from "../../../../db/queries.js";
import CollectButton from "../../../../features/api/components/CollectButton.js";
import { hyperview } from "../../../../lib/hxml.js";
import { getBaseUrl } from "../../../../lib/hyperview.js";
import { getIsHyperview } from "../../../../features/hyperview/lib.js";
import { Behavior, Text, View } from "../../../../lib/hxml-comps.js";
import { routeParam } from "../../../../lib/routeParam.js";
const updateLibraryPage = () => "library:updated";
const POST = createRoute(async (c) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview ? postCollectHyperview(c) : postCollectWeb(c);
});
const postCollectHyperview = async (c) => {
  const user = await getUser(c);
  const userId = user?.id;
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);
  if (!userId) {
    const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to collect this book.")}`;
    return hv(
      /* @__PURE__ */ jsxs(View, { xmlns: "https://hyperview.org/hyperview", children: [
        /* @__PURE__ */ jsx(Behavior, { trigger: "load", action: "new", verb: "get", href: modalHref }),
        /* @__PURE__ */ jsx(Text, { style: "book-action-label", children: "+" }),
        /* @__PURE__ */ jsx(Behavior, { verb: "get", action: "new", href: modalHref })
      ] }),
      401
    );
  }
  const bookId = routeParam(c, "bookId");
  const [err, book] = await getBookPermissionData(bookId);
  if (err || !book) {
    return hv(/* @__PURE__ */ jsx("text", { style: "book-action-label", children: "?" }), err ? 400 : 404);
  }
  const isCurrentlyCollected = Boolean(
    await findCollectionItem(userId, bookId)
  );
  try {
    if (isCurrentlyCollected) {
      await deleteCollectionItem(userId, bookId);
    } else {
      await insertCollectionItem(userId, bookId);
      publishCollectActivity(user, book);
      await createBookCollectedNotification(user, book);
    }
  } catch (error) {
    console.error("Failed to add/remove book from collection", error);
    return hv(/* @__PURE__ */ jsx("text", { style: "book-action-label", children: "!" }));
  }
  const nowCollected = Boolean(await findCollectionItem(userId, bookId));
};
const postCollectWeb = async (c) => {
  const bookId = routeParam(c, "bookId");
  const user = await getUser(c);
  const userId = user?.id;
  if (!userId) return c.html(/* @__PURE__ */ jsx(AuthModal, { action: "to collect this book." }), 401);
  const body = await c.req.parseBody();
  const isCurrentlyCollected = body.isCollected === "true";
  const isCircleButton = body.buttonType === "circle";
  const [err, book] = await getBookPermissionData(bookId);
  if (err || !book) return showErrorAlert(c, err?.reason ?? "Book not found");
  try {
    if (isCurrentlyCollected) {
      await deleteCollectionItem(userId, bookId);
    } else {
      await insertCollectionItem(userId, bookId);
      publishCollectActivity(user, book);
      await createBookCollectedNotification(user, book);
    }
  } catch (error) {
    console.error("Failed to add/remove book from collection", error);
    return showErrorAlert(c);
  }
  const message = isCurrentlyCollected ? `${book.title} has been removed from your collection` : `${book.title} has been added to your collection`;
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message }),
      /* @__PURE__ */ jsx(CollectButton, { book, user, isCircleButton }),
      /* @__PURE__ */ jsx("div", { id: "modal-root" }),
      dispatchEvents([updateLibraryPage()])
    ] })
  );
};
export {
  POST
};
