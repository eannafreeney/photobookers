import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { hyperview } from "../../../../../../lib/hxml";
import { Spinner, Text } from "../../../../../../lib/hxml-comps";
import CreatorCard from "../../../../../../features/hyperview/components/CreatorCard";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { getUser } from "../../../../../../utils";
import { followFlagsForCreators } from "../../../../../../features/hyperview/findFlags";
import { getPublisherByBookId } from "../../../../../../features/dashboard/books/services";
import { bookIdSchema } from "../../../../../../schemas";
import { BOOK_PUBLISHER_FEED_ID } from "./publisher-books/[publisherId]";

export const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  const [error, result] = await getPublisherByBookId(bookId);

  if (error || !result?.publisher) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview">
        <Text style="comments-placeholder">Publisher not found.</Text>
      </view>,
      404,
    );
  }

  const { publisher, publisherId } = result;
  const followingByCreatorId = await followFlagsForCreators(user, [publisher]);
  const booksHref = `${baseUrl}/hyperview/books/${bookId}/tab/publisher-books/${publisherId}`;

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      <CreatorCard
        creator={publisher}
        baseUrl={baseUrl}
        showHeader={false}
        isFollowing={followingByCreatorId[publisher.id] ?? false}
      />
      <Text style="artist-name">Books</Text>
      <view
        id={BOOK_PUBLISHER_FEED_ID}
        style="artist-books-lazy"
        trigger="visible"
        once="true"
        verb="get"
        href={booksHref}
        action="replace"
      >
        <Spinner />
        <Text style="comments-placeholder">Loading…</Text>
      </view>
    </view>,
  );
});
