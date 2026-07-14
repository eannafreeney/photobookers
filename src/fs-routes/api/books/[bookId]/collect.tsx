import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AuthModal from "../../../../components/app/AuthModal";
import { getBookPermissionData } from "../../../../features/api/services";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { publishCollectActivity } from "../../../../features/api/utils";
import { createBookCollectedNotification } from "../../../../domain/notifications/utils";
import Alert from "../../../../components/app/Alert";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import {
  deleteCollectionItem,
  findCollectionItem,
  insertCollectionItem,
} from "../../../../db/queries";
import CollectButton from "../../../../features/api/components/CollectButton";
import { hyperview } from "../../../../lib/hxml";
import { getBaseUrl } from "../../../../lib/hyperview";
import { getIsHyperview } from "../../../../features/hyperview/lib";
import { Behavior, Text, View } from "../../../../lib/hxml-comps";
import { routeParam } from "../../../../lib/routeParam";

const updateShelfPage = () => "shelf:updated";

export const POST = createRoute(async (c: Context) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview ? postCollectHyperview(c) : postCollectWeb(c);
});

const postCollectHyperview = async (c: Context) => {
  const user = await getUser(c);
  const userId = user?.id;
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);

  if (!userId) {
    const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to collect this book.")}`;
    return hv(
      <View xmlns="https://hyperview.org/hyperview">
        <Behavior trigger="load" action="new" verb="get" href={modalHref} />
        <Text style="book-action-label">+</Text>
        <Behavior verb="get" action="new" href={modalHref} />
      </View>,
      401,
    );
  }

  const bookId = routeParam(c, "bookId");

  const [err, book] = await getBookPermissionData(bookId);
  if (err || !book) {
    return hv(<text style="book-action-label">?</text>, err ? 400 : 404);
  }

  const isCurrentlyCollected = Boolean(
    await findCollectionItem(userId, bookId),
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
    return hv(<text style="book-action-label">!</text>);
  }

  const nowCollected = Boolean(await findCollectionItem(userId, bookId));

  // return hv(
  //   <HyperviewBookCollectInner
  //     bookId={bookId}
  //     baseUrl={baseUrl}
  //     isActive={nowCollected}
  //   />,
  // );
};

const postCollectWeb = async (c: Context) => {
  const bookId = routeParam(c, "bookId");
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId) return c.html(<AuthModal action="to collect this book." />, 401);

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

  const message = isCurrentlyCollected
    ? `${book.title} has been removed from your collection`
    : `${book.title} has been added to your collection`;

  return c.html(
    <>
      <Alert type="success" message={message} />
      <CollectButton book={book} user={user} isCircleButton={isCircleButton} />
      <div id="modal-root"></div>
      {dispatchEvents([updateShelfPage()])}
    </>,
  );
};
