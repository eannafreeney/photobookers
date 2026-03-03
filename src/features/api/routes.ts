import { Hono } from "hono";
import {
  followCreator,
  getMobileSearchScreen,
  getSearchResults,
  wishlistBook,
} from "./controllers";

export const apiRoutes = new Hono();

apiRoutes.post("/follow/creator/:creatorId", followCreator);
apiRoutes.post("/wishlist/:bookId", wishlistBook);
apiRoutes.get("/search", getSearchResults);
apiRoutes.get("/search/mobile", getMobileSearchScreen);
