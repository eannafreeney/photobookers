import { PropsWithChildren } from "hono/jsx";
import {
  Behavior,
  Image,
  Spinner,
  Style,
  Text,
  View,
} from "../../../lib/hxml-comps";
import { CreatorCardResult } from "../../../constants/queries";
import { xmlText } from "../../../lib/hxml";

export const CREATORS_LOAD_MORE_ID = "creators-load-more";

type Props = {
  creators: CreatorCardResult[];
  baseUrl: string;
  page: number;
  hasMore: boolean;
  loadMoreHref?: string;
};

const CreatorsList = ({
  creators,
  baseUrl,
  page,
  hasMore,
  loadMoreHref,
}: Props) => {
  if (creators.length === 0) return <></>;

  return (
    <>
      {creators.map((creator) => (
        <View style="creators-list-row">
          <Behavior
            trigger="press"
            action="push"
            href={`${baseUrl}/hyperview/creators/${creator.id}/tab/books`}
          />
          {creator.coverUrl ? (
            <Image
              source={creator.coverUrl}
              style="creators-list-avatar"
              resize-mode="cover"
            />
          ) : (
            <View style="creators-list-avatar-placeholder" />
          )}
          <View style="creators-list-main">
            <Text style="creators-list-name">
              {xmlText(creator.displayName)}
            </Text>
            <Text style="creators-list-type">{creator.type}</Text>
          </View>
          {creator.status === "verified" ? (
            <Text style="creators-list-verified">✓</Text>
          ) : null}
        </View>
      ))}
      {hasMore && loadMoreHref ? (
        <view
          id={CREATORS_LOAD_MORE_ID}
          style="creators-list-spinner"
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
};

export default CreatorsList;

type MessageProps = PropsWithChildren;

/** Empty/error/sign-in states for `#tab-area`. */
export const CreatorsListMessage = ({ children }: MessageProps) => (
  <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
    {children}
  </view>
);

export const creatorsListStyles = () => (
  <>
    <Style
      id="creators-list-row"
      flexDirection="row"
      alignItems="center"
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={16}
      paddingRight={16}
      borderBottomWidth={1}
      borderBottomColor="#eeeeee"
    />
    <Style
      id="creators-list-main"
      flex={1}
      flexDirection="column"
      marginLeft={12}
    />
    <Style
      id="creators-list-name"
      fontSize={15}
      fontWeight="600"
      color="#111111"
    />
    <Style
      id="creators-list-type"
      fontSize={12}
      color="#666666"
      marginTop={2}
      textTransform="uppercase"
    />
    <Style id="creators-list-avatar" width={48} height={48} borderRadius={24} />
    <Style
      id="creators-list-avatar-placeholder"
      width={48}
      height={48}
      borderRadius={24}
      backgroundColor="#e5e5e5"
    />
    <Style
      id="creators-list-verified"
      fontSize={14}
      fontWeight="700"
      color="#2563eb"
    />
    <Style
      id="creators-list-spinner"
      alignItems="center"
      justifyContent="center"
      paddingTop={16}
      paddingBottom={16}
    />
  </>
);
