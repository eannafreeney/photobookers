import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml";
import { Style, View } from "../../../../../../lib/hxml-comps";
import { getBooksByCreatorSlug } from "../../../../../../features/app/services";
import { paramValidator } from "../../../../../../lib/validator";
import { notFoundScreen } from "../../../../../../lib/hxml-components";
import { AppLayout } from "../../../../+layout";
import CreatorCard, {
  creatorCardStyles,
} from "../../../../../../features/hyperview/components/CreatorCard";
import { bookCardStyles } from "../../../../../../features/hyperview/components/BookCard";
import CreatorTabs, {
  creatorTabStyles,
} from "../../../../../../features/hyperview/components/CreatorTabs";
import { getUser } from "../../../../../../utils";
import { likeFlagsForBooks } from "../../../../../../features/hyperview/likeFlags";
import CreatorPage from "../../../../../../features/hyperview/components/CreatorPage";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { creatorIdSchema } from "../../../../../../schemas";
import { getBooksByCreatorId } from "../../../../../../features/dashboard/admin/creators/services";
import CreatorBanner from "../../../../../../features/hyperview/components/CreatorBanner";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const baseUrl = getBaseUrl(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");

  const [error, result] = await getBooksByCreatorId(creatorId, currentPage);
  const hv = hyperview(c);

  if (error || !result?.books || !result?.creator) {
    return hv(notFoundScreen("Book not found."), 404);
  }

  const { creator, books } = result;
  const user = await getUser(c);
  const likesByBookId = await likeFlagsForBooks(user, books);

  return hv(
    <AppLayout title={creator.displayName} extraStyles={pageStyles()}>
      <CreatorBanner creator={creator} baseUrl={baseUrl} />
      <CreatorTabs baseUrl={baseUrl} creatorId={creator.id} activeTab="books" />
      <View id="tab-area" style="page-content">
        <CreatorPage
          books={books}
          creator={creator}
          baseUrl={baseUrl}
          user={user}
          likesByBookId={likesByBookId}
        />
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style id="page-content" margin={16} />
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
      marginBottom={20}
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
  </>
);
