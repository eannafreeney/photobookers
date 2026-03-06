import { Hono } from "hono";
import {
  collectBook,
  followCreator,
  getMobileSearchScreen,
  getSearchResults,
  processNewsletter,
  wishlistBook,
} from "./controllers";
import { formValidator } from "../../lib/validator";
import { newsletterFormSchema } from "../app/schema";

export const apiRoutes = new Hono();

apiRoutes.post("/creators/:creatorId/follow", followCreator);
apiRoutes.post("/books/:bookId/wishlist", wishlistBook);
apiRoutes.post("/books/:bookId/collect", collectBook);
apiRoutes.get("/search", getSearchResults);
apiRoutes.get("/search/mobile", getMobileSearchScreen);
apiRoutes.post(
  "/newsletter",
  formValidator(newsletterFormSchema),
  processNewsletter,
);
