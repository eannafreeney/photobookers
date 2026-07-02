import { CreatorCardResult } from "../../../constants/queries";
import { truncate } from "../../../lib/utils";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import VerificationBadge from "./VerificationBadge";

type Props = {
  creator: CreatorCardResult;
  baseUrl: string;
};

const CreatorCircle = ({ creator, baseUrl }: Props) => {
  const isVerified = creator.status === "verified";

  return (
    <View style="trending-creator-circle">
      <Behavior
        href={`${baseUrl}/hyperview/creators/${creator.id}/tab/books`}
      />
      <View style="trending-creator-avatar-wrap">
        {creator.coverUrl ? (
          <Image
            source={creator.coverUrl}
            style="trending-creator-avatar"
            resize-mode="cover"
          />
        ) : (
          <View style="trending-creator-avatar-placeholder" />
        )}
        {isVerified ? (
          <View style="trending-creator-avatar-badge">
            <VerificationBadge isVerified={isVerified} baseUrl={baseUrl} />
          </View>
        ) : null}
      </View>
      <Text style="trending-creator-name" number-of-lines={2}>
        {truncate(creator.displayName ?? "", 20)}
      </Text>
    </View>
  );
};

export default CreatorCircle;

export const creatorCircleStyles = () => (
  <>
    <Style
      id="trending-creator-circle"
      width={96}
      marginRight={12}
      flexDirection="column"
      alignItems="center"
      gap={12}
    />
    <Style
      id="trending-creator-avatar-wrap"
      width={96}
      height={96}
      position="relative"
    />
    <Style
      id="trending-creator-avatar"
      width={96}
      height={96}
      borderRadius={48}
    />
    <Style
      id="trending-creator-avatar-placeholder"
      width={96}
      height={96}
      borderRadius={48}
      backgroundColor="#e4e0d5"
    />
    <Style
      id="trending-creator-avatar-badge"
      position="absolute"
      top={-1}
      right={-1}
    />
    <Style
      id="trending-creator-name"
      fontSize={14}
      fontWeight="500"
      color="#191613"
      textAlign="center"
    />
  </>
);
