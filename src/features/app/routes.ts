import { Hono } from "hono";
import {
  getAboutPage,
  getArtistsPage,
  getBookDetailPage,
  getBookPreviewPage,
  getContactPage,
  getCreatorDetailPage,
  getFeaturedPage,
  getFeedPage,
  getHomePage,
  getLibraryPage,
  getPublishersPage,
  getTagPage,
  getTermsPage,
  getWishlistedBooks,
} from "./controllers";
import { requireBookPreviewAccess } from "../../middleware/bookGuard";

export const appRoutes = new Hono();

// HOME
appRoutes.get("/", getHomePage);
appRoutes.get("/creators/:slug", getCreatorDetailPage);
appRoutes.get("/books/:slug", getBookDetailPage);
appRoutes.get(
  "/books/preview/:slug",
  requireBookPreviewAccess,
  getBookPreviewPage,
);
appRoutes.get("/books/tags/:tag", getTagPage);
appRoutes.get("/featured", getFeaturedPage);
appRoutes.get("/feed", getFeedPage);
appRoutes.get("/library", getLibraryPage);
appRoutes.get("/about", getAboutPage);
appRoutes.get("/contact", getContactPage);
appRoutes.get("/terms", getTermsPage);
appRoutes.get("/artists", getArtistsPage);
appRoutes.get("/publishers", getPublishersPage);
appRoutes.get("/wishlist-books", getWishlistedBooks);
