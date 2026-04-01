import { Hono } from "hono";
import {
  addBookComment,
  collectBook,
  deleteBookComment,
  followCreator,
  getCreateCommentModal,
  getEditCommentModal,
  getMobileSearchScreen,
  getNewsletterModal,
  getSearchResults,
  likeBook,
  processNewsletter,
  streamActivity,
  updateBookComment,
  wishlistBook,
} from "./controllers";
import { formValidator, paramValidator } from "../../lib/validator";
import {
  addCommentFormSchema,
  commentIdSchema,
  newsletterFormSchema,
} from "./schema";
import { bookIdSchema } from "../../schemas";
import { requireCommentOwner } from "../../middleware/commentGuard";
import { editCommentParamSchema } from "./schema";

export const apiRoutes = new Hono();

apiRoutes.post("/creators/:creatorId/follow", followCreator);
apiRoutes.post("/books/:bookId/wishlist", wishlistBook);
apiRoutes.post("/books/:bookId/collect", collectBook);
apiRoutes.post("/books/:bookId/like", likeBook);
apiRoutes.get("/activity/stream", streamActivity);
apiRoutes.get("/search", getSearchResults);
apiRoutes.get("/search/mobile", getMobileSearchScreen);
apiRoutes.get(
  "/books/:bookId/comments",
  paramValidator(bookIdSchema),
  getCreateCommentModal,
);
apiRoutes.get(
  "/books/:bookId/update/:commentId",
  paramValidator(editCommentParamSchema),
  getEditCommentModal,
);
apiRoutes.get(
  "/newsletter",
  paramValidator(editCommentParamSchema),
  getNewsletterModal,
);

// POST API Routes
apiRoutes.post(
  "/newsletter",
  formValidator(newsletterFormSchema),
  processNewsletter,
);
apiRoutes.post(
  "/books/:bookId/comments",
  paramValidator(bookIdSchema),
  formValidator(addCommentFormSchema),
  addBookComment,
);
apiRoutes.post(
  "/books/:bookId/update/:commentId",
  paramValidator(editCommentParamSchema),
  formValidator(addCommentFormSchema),
  requireCommentOwner,
  updateBookComment,
);
apiRoutes.post(
  "/books/:bookId/delete/:commentId",
  paramValidator(editCommentParamSchema),
  requireCommentOwner,
  deleteBookComment,
);
