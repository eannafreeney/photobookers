import { FC } from "hono/jsx";
import { ScrollView, Style, View } from "../../../lib/hxml-comps";
import { getCurrentFairs, getUpcomingFairs } from "../../app/fairs/services";
import FairCard, { fairCardStyles } from "./FairCard";
import SectionHeader, { sectionHeaderStyles } from "./SectionHeader";

const FEATURED_FAIRS_LIMIT = 5;

type Props = {
  baseUrl: string;
};

const FairsSection = async ({ baseUrl }: Props) => {
  const [[upcomingError, upcomingResult], [currentError, currentResult]] =
    await Promise.all([
      getUpcomingFairs(1, FEATURED_FAIRS_LIMIT),
      getCurrentFairs(1, FEATURED_FAIRS_LIMIT),
    ]);

  if (upcomingError || currentError) return <></>;

  const seen = new Set<string>();
  const allFairs = [
    ...(currentResult?.fairs ?? []),
    ...(upcomingResult?.fairs ?? []),
  ]
    .filter((fair) => {
      if (seen.has(fair.id)) return false;
      seen.add(fair.id);
      return true;
    })
    .slice(0, FEATURED_FAIRS_LIMIT);

  if (allFairs.length === 0) return <></>;

  return (
    <View style="fairs-section">
      <SectionHeader
        title="Book Fairs"
        viewAllHref={`${baseUrl}/hyperview/fairs`}
      />
      <ScrollView
        style="fairs-scroll"
        horizontal="true"
        shows-scroll-indicator="false"
      >
        {allFairs.map((fair) => (
          <FairCard
            key={fair.id}
            fair={fair}
            href={`${baseUrl}/hyperview/fairs/${fair.slug}`}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default FairsSection;

export const fairsSectionStyles = () => (
  <>
    {sectionHeaderStyles()}
    {fairCardStyles()}
    <Style
      id="fairs-section"
      flexDirection="column"
      gap={12}
      marginBottom={12}
    />
    <Style id="fairs-scroll" flexDirection="row" />
  </>
);
