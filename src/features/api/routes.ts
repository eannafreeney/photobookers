import { Hono } from "hono";
import {
  addBookComment,
  collectBook,
  deleteBookComment,
  followCreator,
  getMobileSearchScreen,
  getSearchResults,
  processNewsletter,
  wishlistBook,
} from "./controllers";
import { formValidator, paramValidator } from "../../lib/validator";
import { addCommentFormSchema, commentIdSchema, newsletterFormSchema } from "./schema";
import { bookIdSchema } from "../../schemas";


export const apiRoutes = new Hono();

apiRoutes.post("/creators/:creatorId/follow", followCreator);
apiRoutes.post("/books/:bookId/wishlist", wishlistBook);
apiRoutes.post("/books/:bookId/collect", collectBook);
apiRoutes.get("/search", getSearchResults);
apiRoutes.get("/search/mobile", getMobileSearchScreen);

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
  "/comments/:commentId/delete",
  paramValidator(commentIdSchema),
  deleteBookComment,
);
