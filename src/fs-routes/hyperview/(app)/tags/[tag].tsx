import { createRoute } from "hono-fsr";
import { getBaseUrl } from "../../../../lib/hyperview";
import { paramValidator } from "../../../../lib/validator";
import { creatorIdSchema } from "../../../../schemas";
import { getBooksByTag } from "../../../../features/app/services";
import { tagSchema } from "../../../../features/app/schema";
import { hyperview } from "../../../../lib/hxml";
import { notFoundScreen } from "../../../../lib/hxml-components";
import { getUser } from "../../../../utils";
import { likeFlagsForBooks } from "../../../../features/hyperview/likeFlags";
import { AppLayout } from "../../+layout";
import { BookCardResult } from "../../../../constants/queries";
import BookCard, {
  bookCardStyles,
} from "../../../../features/hyperview/components/BookCard";
import { View } from "../../../../lib/hxml-comps";

export const GET = createRoute(paramValidator(tagSchema), async (c) => {
  const tag = c.req.valid("param").tag;
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");

  const [error, result] = await getBooksByTag(tag, currentPage);
  const hv = hyperview(c);

  if (error || !result?.books) {
    return hv(notFoundScreen("Books not found."), 404);
  }

  const { books } = result;
  const likesByBookId = await likeFlagsForBooks(user, books);

  return hv(
    <AppLayout title={`# ${tag}`} extraStyles={pageStyles()}>
      <View id="page-content" style="page-content">
        {books.map((book: BookCardResult) => (
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

const pageStyles = () => <>{bookCardStyles()}</>;
