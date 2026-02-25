import { Hono } from "hono";
import {
  createBookAsPublisher,
  getAddBookPage,
  getBooksOverview,
} from "./controllers";
import { bookFormSchema } from "../../../schemas";
import { limitBooksPerDay } from "../../../middleware/booksPerDayLimit";
import { formValidator } from "../../../lib/validator";

export const booksDashboardRoutes = new Hono();

booksDashboardRoutes.get("/", getBooksOverview);
booksDashboardRoutes.get("/new", getAddBookPage);
booksDashboardRoutes.post(
  "/new/publisher",
  limitBooksPerDay,
  formValidator(bookFormSchema),
  createBookAsPublisher,
);
