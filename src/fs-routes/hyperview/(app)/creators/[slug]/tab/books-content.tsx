import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml";
import { Text, View } from "../../../../../../lib/hxml-comps";
import { getBooksByCreatorSlug } from "../../../../../../features/app/services";
import { paramValidator } from "../../../../../../lib/validator";
import { slugSchema } from "../../../../../../features/app/schema";
import type { BookCardResult } from "../../../../../../constants/queries";
import BookCard from "../../../../../../features/hyperview/components/BookCard";

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const hv = hyperview(c);

  const proto = c.req.header("x-forwarded-proto") ?? "http";
  const host = c.req.header("host") ?? "localhost:5173";
  const baseUrl = `${proto}://${host}`;

  const [error, result] = await getBooksByCreatorSlug(slug);

  if (error || !result?.creator) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">No books found.</Text>
      </view>,
      404,
    );
  }

  const { creator, books } = result;

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      {books.map((book: BookCardResult) => (
        <BookCard
          key={book.id}
          book={book}
          baseUrl={baseUrl}
          currentCreatorId={creator.id}
        />
      ))}
    </view>,
  );
});
