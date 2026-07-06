import { createRoute } from "hono-fsr";
import { eq } from "drizzle-orm";
import { getUser } from "../../../utils.js";
import { db } from "../../../db/client.js";
import { creators } from "../../../db/schema.js";
import { reorderBooksForCreator } from "../../../features/dashboard/books/services.js";
import {
  showErrorAlert,
  showSuccessAlert
} from "../../../lib/alertHelpers.js";
const POST = createRoute(async (c) => {
  const user = await getUser(c);
  let orderedIds;
  let creatorId;
  try {
    const body = await c.req.json();
    orderedIds = body.orderedIds ?? [];
    creatorId = body.creatorId;
  } catch {
    return showErrorAlert(c, "Invalid request body");
  }
  let creator;
  if (creatorId) {
    if (!user.isAdmin) {
      return showErrorAlert(c, "Forbidden", 403);
    }
    creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      columns: { id: true, type: true, slug: true }
    });
    if (!creator) {
      return showErrorAlert(c, "Creator not found", 404);
    }
  } else if (user.creator) {
    creator = user.creator;
  } else {
    return showErrorAlert(c, "Creator not found", 403);
  }
  const [error] = await reorderBooksForCreator(creator, orderedIds);
  if (error) {
    return showErrorAlert(c, error.reason);
  }
  return showSuccessAlert(c, "Book order saved");
});
export {
  POST
};
