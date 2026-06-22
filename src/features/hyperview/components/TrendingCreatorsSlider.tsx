import { getTopCreatorsByViews } from "../../book-views/services";
import { ScrollView, Style, View } from "../../../lib/hxml-comps";
import SectionHeader from "./SectionHeader";
import { verificationBadgeStyles } from "./VerificationBadge";
import CreatorCircle, { creatorCircleStyles } from "./CreatorCirle";

export const TRENDING_CREATORS_LIMIT = 20;

type Props = {
  baseUrl: string;
};

const TrendingCreatorsSlider = async ({ baseUrl }: Props) => {
  const [err, creators] = await getTopCreatorsByViews(TRENDING_CREATORS_LIMIT);

  if (err || !creators?.length) return <></>;

  return (
    <View style="trending-creators-section">
      <SectionHeader
        title="Trending Creators"
        viewAllHref={`${baseUrl}/hyperview/creators`}
      />
      <ScrollView
        style="trending-creators-scroll"
        horizontal="true"
        shows-scroll-indicator="false"
      >
        {creators.map((creator) => (
          <CreatorCircle key={creator.id} creator={creator} baseUrl={baseUrl} />
        ))}
      </ScrollView>
    </View>
  );
};

export default TrendingCreatorsSlider;

export const trendingCreatorsStyles = () => (
  <>
    <Style
      id="trending-creators-section"
      flexDirection="column"
      gap={0}
      marginBottom={12}
    />
    <Style id="trending-creators-scroll" flexDirection="row" marginTop={12} />
    <Style
      id="trending-creator-circle"
      width={80}
      marginRight={24}
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
      top={0}
      right={0}
    />
    <Style
      id="trending-creator-name"
      fontSize={14}
      fontWeight="500"
      color="#191613"
      textAlign="center"
    />
    {verificationBadgeStyles()}
    {creatorCircleStyles()}
  </>
);
