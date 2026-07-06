import { createMiddleware } from "hono/factory";
import { getUser } from "../utils.js";
import { setFlash } from "../utils.js";
import { db } from "../db/client.js";
import { books } from "../db/schema.js";
import { and, count, eq, gte } from "drizzle-orm";
const MAX_BOOKS_PER_DAY = 5;
const limitBooksPerDay = createMiddleware(async (c, next) => {
  const user = await getUser(c);
  if (!user) {
    return c.redirect("/auth/login");
  }
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const [{ value: booksCreated }] = await db.select({ value: count() }).from(books).where(
    and(
      eq(books.createdByUserId, user.id),
      gte(books.createdAt, twentyFourHoursAgo)
    )
  );
  if (booksCreated >= MAX_BOOKS_PER_DAY) {
    await setFlash(
      c,
      "danger",
      `You can only create up to ${MAX_BOOKS_PER_DAY} books per day. Try again tomorrow.`
    );
    return c.redirect("/dashboard");
  }
  await next();
});
export {
  limitBooksPerDay
};
