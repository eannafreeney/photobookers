import { createMiddleware } from "hono/factory";
import { getUser } from "../utils";
import { setFlash } from "../utils";
import { db } from "../db/client";
import { books } from "../db/schema";
import { and, count, eq, gte } from "drizzle-orm";
import { Context } from "hono";

const MAX_BOOKS_PER_DAY = 5;

export const limitBooksPerDay = createMiddleware(async (c: Context, next) => {
  const user = await getUser(c);
  if (!user) {
    return c.redirect("/auth/login");
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [{ value: booksCreated }] = await db
    .select({ value: count() })
    .from(books)
    .where(
      and(
        eq(books.createdByUserId, user.id),
        gte(books.createdAt, twentyFourHoursAgo),
      ),
    );

  if (booksCreated >= MAX_BOOKS_PER_DAY) {
    await setFlash(
      c,
      "danger",
      `You can only create up to ${MAX_BOOKS_PER_DAY} books per day. Try again tomorrow.`,
    );
    return c.redirect("/dashboard/books");
  }

  await next();
});
