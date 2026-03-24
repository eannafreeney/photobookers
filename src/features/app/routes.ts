import { Hono } from "hono";
import {
  getAboutPage,
  getArtistsPage,
  getBookDetailPage,
  getBookPreviewPage,
  getContactPage,
  getCreatorDetailPage,
  getCreatorSpotlightFragment,
  getFeaturedBooksFragment,
  getFeaturedPage,
  getFeedPage,
  getHomePage,
  getLatestBooksFragment,
  getLibraryPage,
  getMessagesFeedPage,
  getNewsletterConfirmationPage,
  getPublishersPage,
  getRelatedBooksFragment,
  getTagPage,
  getTermsPage,
  getUserUpdateModal,
  processContact,
} from "./controllers";
import { requireBookPreviewAccess } from "../../middleware/bookGuard";
import {
  formValidator,
  paramValidator,
  queryValidator,
} from "../../lib/validator";
import { contactFormSchema, slugSchema, tagSchema } from "./schema";
import { userIdSchema } from "../../schemas";
import { z } from "zod";

export const app = new Hono();

// HOME
app.get("/", getHomePage);
app.get("/creators/:slug", paramValidator(slugSchema), getCreatorDetailPage);
app.get("/books/:slug", paramValidator(slugSchema), getBookDetailPage);
app.get(
  "/books/preview/:slug",
  paramValidator(slugSchema),
  requireBookPreviewAccess,
  getBookPreviewPage,
);
app.get("/books/tags/:tag", paramValidator(tagSchema), getTagPage);
app.get("/featured", getFeaturedPage);
app.get("/feed", getFeedPage);
app.get("/library", getLibraryPage);
app.get("/about", getAboutPage);
app.get("/contact", getContactPage);
app.get("/terms", getTermsPage);
app.get("/artists", getArtistsPage);
app.get("/publishers", getPublishersPage);
app.get("/messages", getMessagesFeedPage);
app.get("/newsletter-confirmation", getNewsletterConfirmationPage);
app.get(
  "/users/:userId/update",
  formValidator(z.object({ msg: z.string().optional() })),
  paramValidator(userIdSchema),
  getUserUpdateModal,
);

// POST
app.post("/contact", formValidator(contactFormSchema), processContact);

// Fragment routes
app.get("/fragments/latest-books", getLatestBooksFragment);
app.get("/fragments/featured-books", getFeaturedBooksFragment);
app.get("/fragments/creator-spotlights", getCreatorSpotlightFragment);
app.get(
  "/fragments/related-books/:slug",
  paramValidator(slugSchema),
  getRelatedBooksFragment,
);
