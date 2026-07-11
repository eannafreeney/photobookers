import { Style, Text, View } from "../../../lib/hxml-comps";
import {
  visibleHomepageActivityParts,
  type HomepageActivityStats,
} from "../../app/homepageActivityVisibility";

const HomepageActivityPulse = ({
  bookViews,
  profileViews,
}: HomepageActivityStats) => {
  const { showBooks, showProfiles } = visibleHomepageActivityParts({
    bookViews,
    profileViews,
  });
  if (!showBooks && !showProfiles) return null;

  return (
    <View style="homepage-activity-pulse">
      <View style="homepage-activity-pulse-row">
        <Text style="homepage-activity-pulse-text">This week: </Text>
        {showBooks ? (
          <>
            <Text style="homepage-activity-pulse-emphasis">
              {bookViews.toLocaleString()}
            </Text>
            <Text style="homepage-activity-pulse-text"> book views</Text>
          </>
        ) : null}
        {showBooks && showProfiles ? (
          <Text style="homepage-activity-pulse-text"> and </Text>
        ) : null}
        {showProfiles ? (
          <>
            <Text style="homepage-activity-pulse-emphasis">
              {profileViews.toLocaleString()}
            </Text>
            <Text style="homepage-activity-pulse-text"> creator profile views</Text>
          </>
        ) : null}
        <Text style="homepage-activity-pulse-text">.</Text>
      </View>
    </View>
  );
};

export default HomepageActivityPulse;

export const homepageActivityPulseStyles = () => (
  <>
    <Style id="homepage-activity-pulse" paddingHorizontal={16} />
    <Style
      id="homepage-activity-pulse-row"
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="center"
      alignItems="center"
    />
    <Style
      id="homepage-activity-pulse-text"
      fontSize={13}
      color="#45413a"
      lineHeight={18}
    />
    <Style
      id="homepage-activity-pulse-emphasis"
      fontSize={13}
      fontWeight="600"
      color="#191613"
      lineHeight={18}
    />
  </>
);
