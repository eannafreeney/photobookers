import { Image, Spinner, Style, Text, View } from "../../../lib/hxml-comps";
import { formatDate } from "../../../utils";

export const CREATOR_POSTS_LOAD_MORE_ID = "creator-posts-load-more";

type CreatorInfo = {
  displayName: string;
  coverUrl: string | null;
};

type Post = {
  id: string;
  body: string;
  createdAt: Date | null;
  imageUrl: string | null;
};

type Props = {
  posts: Post[];
  creator: CreatorInfo;
  canReadMessages: boolean;
  page?: number;
  hasMore?: boolean;
  loadMoreHref?: string;
};

const CreatorPostsList = ({
  posts,
  creator,
  canReadMessages,
  page = 1,
  hasMore = false,
  loadMoreHref,
}: Props) => (
  <>
    {posts.map((post) => (
      <View key={post.id} style="creator-post-card">
        <View style="creator-post-header">
          {creator.coverUrl ? (
            <Image
              source={creator.coverUrl}
              style="creator-post-avatar"
              resize-mode="cover"
            />
          ) : null}
          <View style="creator-post-header-text">
            <Text style="creator-post-author">{creator.displayName}</Text>
            {post.createdAt ? (
              <Text style="creator-post-date">
                {formatDate(post.createdAt)}
              </Text>
            ) : null}
          </View>
        </View>
        {canReadMessages ? (
          <>
            {post.body ? (
              <Text style="creator-post-body">{post.body}</Text>
            ) : null}
            {post.imageUrl ? (
              <Image
                source={post.imageUrl}
                style="creator-post-image"
                resize-mode="cover"
              />
            ) : null}
          </>
        ) : (
          <Text style="creator-post-locked">Follow to unlock</Text>
        )}
      </View>
    ))}
    {hasMore && loadMoreHref ? (
      <view
        id={CREATOR_POSTS_LOAD_MORE_ID}
        style="creator-posts-spinner"
        trigger="visible"
        once="true"
        verb="get"
        href={`${loadMoreHref}?page=${page + 1}`}
        action="replace"
      >
        <Spinner />
      </view>
    ) : null}
  </>
);

export default CreatorPostsList;

export const creatorPostsListStyles = () => (
  <>
    <Style
      id="creator-post-card"
      paddingTop={14}
      paddingBottom={14}
      borderBottomWidth={1}
      borderBottomColor="#e4e0d5"
    />
    <Style
      id="creator-post-header"
      flexDirection="row"
      alignItems="center"
      marginBottom={10}
    />
    <Style
      id="creator-post-avatar"
      width={32}
      height={32}
      borderRadius={16}
      marginRight={8}
    />
    <Style id="creator-post-header-text" flex={1} />
    <Style
      id="creator-post-author"
      fontSize={13}
      fontWeight="600"
      color="#191613"
    />
    <Style id="creator-post-date" fontSize={11} color="#a39d90" marginTop={2} />
    <Style
      id="creator-post-body"
      fontSize={14}
      color="#45413a"
      lineHeight={20}
      marginBottom={8}
    />
    <Style
      id="creator-post-image"
      width="100%"
      height={220}
      borderRadius={8}
      marginBottom={8}
    />
    <Style
      id="creator-post-locked"
      fontSize={13}
      fontWeight="600"
      color="#a39d90"
      textAlign="center"
      paddingTop={12}
      paddingBottom={12}
    />
    <Style
      id="creator-posts-spinner"
      alignItems="center"
      justifyContent="center"
      paddingTop={16}
      paddingBottom={16}
    />
  </>
);
