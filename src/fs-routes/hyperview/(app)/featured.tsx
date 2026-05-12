import { createRoute } from "hono-fsr";
import { getLatestBooks } from "../../../features/app/services";
import { bookRow } from "../../../features/hyperview/components/BookRow";
import { List, Section, Style } from "../../../lib/hxml-comps";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { raw } from "hono/html";
import BookCard, {
  bookCardStyles,
} from "../../../features/hyperview/components/BookCard";

export const GET = createRoute(async (c) => {
  const [error, result] = await getLatestBooks(1, 30);

  // if (error) return hxml(c, errorScreen("Failed to load books."));

  const proto = c.req.header("x-forwarded-proto") ?? "http";
  const host = c.req.header("host") ?? "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  const hv = hyperview(c);

  return hv(
    <AppLayout
      title="Books"
      showBackButton={false}
      extraStyles={bookCardStyles()}
    >
      {result?.books.map((book) => (
        <BookCard key={book.id} book={book} baseUrl={baseUrl} />
      ))}
      {/* <List style="list">
        <Section>{rows}</Section>
      </List> */}
    </AppLayout>,
  );
});
