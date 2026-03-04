import { Hono } from "hono";
import {
  followCreator,
  getMobileSearchScreen,
  getSearchResults,
  wishlistBook,
} from "./controllers";

export const apiRoutes = new Hono();

apiRoutes.post("/creators/:creatorId/follow", followCreator);
apiRoutes.post("/books/:bookId/wishlist", wishlistBook);
apiRoutes.get("/search", getSearchResults);
apiRoutes.get("/search/mobile", getMobileSearchScreen);
