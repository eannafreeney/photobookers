import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AuthModal from "../../../../components/app/AuthModal";
import { getBookPermissionData } from "../../../../features/api/services";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { publishCollectActivity } from "../../../../features/api/utils";
import { createBookCollectedNotification } from "../../../../features/dashboard/admin/notifications/utils";
import Alert from "../../../../components/app/Alert";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import {
  deleteCollectionItem,
  insertCollectionItem,
} from "../../../../db/queries";
import CollectButton from "../../../../features/api/components/CollectButton";

const updateLibraryPage = () => "library:updated";

export const POST = createRoute(async (c: Context) => {
  const bookId = c.req.param("bookId");
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
    console.error("Failed to add/remove book to wishlist", error);
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
      {dispatchEvents([updateLibraryPage()])}
    </>,
  );
});
