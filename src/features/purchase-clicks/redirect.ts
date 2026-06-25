import { getBookBySlug } from "../app/services";
import { getUser } from "../../utils";
import type { Context } from "hono";
import { recordPurchaseClick } from "./services";
import {
  appendPurchaseUtmParams,
  isHttpPurchaseUrl,
  parsePurchaseClickSource,
} from "./urls";
import { routeParam } from "../../lib/routeParam";

export const handleOutboundPurchaseRedirect = async (c: Context) => {
  const bookSlug = routeParam(c, "slug");
  const [error, result] = await getBookBySlug(bookSlug, "published");

  if (error) return c.notFound();

  const { book } = result;
  if (book.approvalStatus !== "approved") return c.notFound();

  const purchaseLink = book.purchaseLink?.trim() ?? "";
  if (!purchaseLink || !isHttpPurchaseUrl(purchaseLink)) return c.notFound();

  const user = await getUser(c);
  const source = parsePurchaseClickSource(c.req.query("source"));
  const referer = c.req.header("referer");

  void recordPurchaseClick({
    bookId: book.id,
    userId: user?.id ?? null,
    source,
    referer,
  }).catch((err) => {
    console.error("Failed to record purchase click", err);
  });

  const destination = appendPurchaseUtmParams(purchaseLink, book.slug);
  return c.redirect(destination, 302);
};
