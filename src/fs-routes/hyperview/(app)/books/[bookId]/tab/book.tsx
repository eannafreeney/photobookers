import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml";
import { Style, View } from "../../../../../../lib/hxml-comps";
import { paramValidator } from "../../../../../../lib/validator";
import { AppLayout } from "../../../../+layout";
import BookTabs, {
  bookTabStyles,
} from "../../../../../../features/hyperview/components/BookTabs";
import { creatorCardStyles } from "../../../../../../features/hyperview/components/CreatorCard";
import BookPage, {
  bookPageStyles,
} from "../../../../../../features/hyperview/components/BookPage";
import { bookCommentsPanelStyles } from "../../../../../../features/hyperview/components/BookCommentsPanel";
import { feedListStyles } from "../../../../../../features/hyperview/components/FeedList";
import { bookIdSchema } from "../../../../../../schemas";
import { getBookById } from "../../../../../../features/dashboard/books/services";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { getUser } from "../../../../../../utils";
import { favoriteFlagsForBooks } from "../../../../../../features/hyperview/findFlags";
import { bookCardStyles } from "../../../../../../features/hyperview/components/BookCard";
import { artistTabStyles } from "./artist";
import { signInPromptStyles } from "../../../../../../features/hyperview/components/SignInPrompt";
import ErrorScreen from "../../../../../../features/hyperview/components/ErrorScreen";

export const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const hv = hyperview(c);
  const user = await getUser(c);
  const baseUrl = getBaseUrl(c);

  const [error, book] = await getBookById(bookId);

  if (error || !book) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message="Book not found." />,
    );
  }

  const galleryImages = [
    book.coverUrl,
    ...((book.images ?? []) as { imageUrl: string }[]).map(
      (row) => row.imageUrl,
    ),
  ].filter((url): url is string => Boolean(url));

  const favoritesByBookId = await favoriteFlagsForBooks(user, [book]);

  return hv(
    <AppLayout
      showDock
      baseUrl={baseUrl}
      title={book.title}
      artist={book.artist?.displayName}
      publisher={book.publisher?.displayName}
      extraStyles={pageStyles()}
      coverUrl={book.coverUrl}
    >
      <BookTabs
        baseUrl={baseUrl}
        bookId={book.id}
        hasPublisher={!!book.publisher}
        activeTab="book"
      />
      <View id="tab-area" style="page-content">
        <BookPage
          galleryImages={galleryImages}
          book={book}
          baseUrl={baseUrl}
          isFavorited={favoritesByBookId[book.id] ?? false}
        />
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style
      id="gallery"
      height={360}
      marginLeft={-16}
      marginRight={-16}
      marginBottom={20}
      flexDirection="row"
    />
    <Style id="gallery-slide" width="90%" marginRight={12} />
    <Style id="gallery-slide-image" width="100%" height={360} />
    <Style
      id="title"
      fontSize={22}
      fontWeight="700"
      color="#111111"
      marginBottom={6}
    />
    <Style id="subtitle" fontSize={15} color="#666666" marginBottom={16} />
    <Style
      id="description"
      fontSize={14}
      color="#444444"
      lineHeight={22}
      marginBottom={8}
    />
    <Style
      id="description-paragraph"
      fontSize={14}
      color="#444444"
      lineHeight={22}
      marginBottom={12}
    />
    <Style id="tab-fragment" flex={1} padding={16} />
    <Style
      id="artist-name"
      fontSize={18}
      fontWeight="600"
      color="#111111"
      marginBottom={8}
    />
    <Style id="artist-bio" fontSize={14} color="#444444" lineHeight={22} />
    <Style
      id="publisher-name"
      fontSize={18}
      fontWeight="600"
      color="#111111"
      marginBottom={8}
    />
    <Style id="publisher-location" fontSize={14} color="#666666" />
    <Style id="comments-placeholder" fontSize={14} color="#999999" />
    <Style
      id="comments-heading"
      fontSize={15}
      fontWeight="600"
      color="#111111"
      marginBottom={12}
    />
    <Style
      id="comments-empty"
      fontSize={13}
      color="#999999"
      textAlign="center"
      padding={16}
    />
    <Style
      id="comment-item"
      paddingTop={12}
      paddingBottom={12}
      borderBottomWidth={1}
      borderBottomColor="#e5e5e5"
    />
    <Style
      id="comment-author-row"
      flexDirection="row"
      alignItems="center"
      marginBottom={6}
    />
    <Style
      id="comment-avatar"
      width={32}
      height={32}
      borderRadius={16}
      marginRight={8}
    />
    <Style
      id="comment-avatar-placeholder"
      width={32}
      height={32}
      borderRadius={16}
      marginRight={8}
      backgroundColor="#e5e5e5"
    />
    <Style id="comment-author-info" flex={1} />
    <Style
      id="comment-username"
      fontSize={13}
      fontWeight="600"
      color="#111111"
    />
    <Style id="comment-date" fontSize={11} color="#999999" marginTop={2} />
    <Style id="comment-body" fontSize={14} color="#444444" lineHeight={20} />
    {creatorCardStyles()}
    {bookTabStyles()}
    {bookPageStyles()}
    {bookCommentsPanelStyles()}
    {feedListStyles()}
    {bookCardStyles()}
    {artistTabStyles()}
    {signInPromptStyles()}
  </>
);
