import { Hono } from "hono";
import {
  followCreator,
  getMobileSearchScreen,
  getSearchResults,
  validateDisplayName,
  validateEmail,
  validateWebsite,
  wishlistBook,
} from "./controllers";

export const apiRoutes = new Hono();

apiRoutes.post("/follow/creator/:creatorId", followCreator);
apiRoutes.post("/wishlist/:bookId", wishlistBook);
apiRoutes.get("/check-email", validateEmail);
apiRoutes.get("/check-displayName", validateDisplayName);
apiRoutes.get("/check-website", validateWebsite);
apiRoutes.get("/search", getSearchResults);
apiRoutes.get("/search/mobile", getMobileSearchScreen);
