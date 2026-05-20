import { createRoute } from "hono-fsr";
import { getLatestBooks } from "../../../features/app/services";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import BookCard, {
  bookCardStyles,
} from "../../../features/hyperview/components/BookCard";
import { Style, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { likeFlagsForBooks } from "../../../features/hyperview/findFlags";

export const GET = createRoute(async (c) => {
  const [error, result] = await getLatestBooks(1, 30);

  // if (error) return hxml(c, errorScreen("Failed to load books."));

  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const books = result?.books ?? [];
  const likesByBookId = await likeFlagsForBooks(user, books);

  const hv = hyperview(c);

  return hv(
    <AppLayout
      title="All Books"
      showBackButton={false}
      showDock
      baseUrl={baseUrl}
      extraStyles={pageStyles()}
    >
      <View id="page-content" style="page-content">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            baseUrl={baseUrl}
            user={user}
            isLiked={likesByBookId[book.id] ?? false}
          />
        ))}
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style id="page-content" margin={16} />
    {bookCardStyles()}
  </>
);
