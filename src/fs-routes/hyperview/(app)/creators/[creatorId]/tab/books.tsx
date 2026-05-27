import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml";
import { Style, View } from "../../../../../../lib/hxml-comps";
import { paramValidator } from "../../../../../../lib/validator";
import { AppLayout } from "../../../../+layout";
import { creatorCardStyles } from "../../../../../../features/hyperview/components/CreatorCard";
import { bookCardStyles } from "../../../../../../features/hyperview/components/BookCard";
import CreatorTabs, {
  creatorTabStyles,
} from "../../../../../../features/hyperview/components/CreatorTabs";
import { getUser } from "../../../../../../utils";
import {
  favoriteFlagsForBooks,
  followFlagsForCreators,
} from "../../../../../../features/hyperview/findFlags";
import CreatorPage, {
  creatorPageStyles,
} from "../../../../../../features/hyperview/components/CreatorPage";
import { relatedCreatorsListStyles } from "../../../../../../features/hyperview/components/RelatedCreatorsList";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { creatorIdSchema } from "../../../../../../schemas";
import { getBooksByCreatorId } from "../../../../../../features/dashboard/admin/creators/services";
import CreatorBanner from "../../../../../../features/hyperview/components/CreatorBanner";
import ErrorScreen from "../../../../../../features/hyperview/components/ErrorScreen";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const hv = hyperview(c);

  const [error, result] = await getBooksByCreatorId(creatorId, currentPage);

  if (error || !result?.books || !result?.creator) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message="Book not found." />,
    );
  }

  const { creator, books, totalPages = 1 } = result;

  const [favoritesByBookId, followingByCreatorId] = await Promise.all([
    favoriteFlagsForBooks(user, books),
    followFlagsForCreators(user, creator ? [creator] : []),
  ]);

  const hasMore = currentPage < totalPages;
  const loadMoreHref = `${baseUrl}/hyperview/creators/${creatorId}/tab/books-content`;

  return hv(
    <AppLayout
      showDock
      baseUrl={baseUrl}
      title={creator.displayName}
      isVerified={creator.status === "verified"}
      extraStyles={pageStyles()}
    >
      <CreatorBanner
        creator={creator}
        baseUrl={baseUrl}
        isFollowing={followingByCreatorId[creator.id] ?? false}
      />
      <CreatorTabs
        baseUrl={baseUrl}
        creatorId={creator.id}
        activeTab="books"
        creatorType={creator.type}
      />
      <View id="tab-area" style="page-content">
        <CreatorPage
          books={books}
          creator={creator}
          baseUrl={baseUrl}
          favoritesByBookId={favoritesByBookId}
          page={currentPage}
          hasMore={hasMore}
          loadMoreHref={loadMoreHref}
        />
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style
      id="cover"
      width="100%"
      height={240}
      borderRadius={8}
      marginBottom={20}
    />
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
      marginBottom={16}
    />
    <Style id="tab-fragment" flex={1} />
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
    {bookCardStyles()}
    {creatorTabStyles()}
    {creatorPageStyles()}
    {relatedCreatorsListStyles()}
  </>
);
