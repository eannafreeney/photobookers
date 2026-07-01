import { getTopCreatorsByViews } from "../../creator-views/services";
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
    {verificationBadgeStyles()}
    {creatorCircleStyles()}
  </>
);
