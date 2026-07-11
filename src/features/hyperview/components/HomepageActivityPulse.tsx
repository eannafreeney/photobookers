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
      <Text style="homepage-activity-pulse-text">
        This week:{" "}
        {showBooks ? (
          <>
            <Text style="homepage-activity-pulse-emphasis">
              {bookViews.toLocaleString()}
            </Text>
            {" book views"}
          </>
        ) : null}
        {showBooks && showProfiles ? " and " : null}
        {showProfiles ? (
          <>
            <Text style="homepage-activity-pulse-emphasis">
              {profileViews.toLocaleString()}
            </Text>
            {" creator profile views"}
          </>
        ) : null}
        .
      </Text>
    </View>
  );
};

export default HomepageActivityPulse;

export const homepageActivityPulseStyles = () => (
  <>
    <Style id="homepage-activity-pulse" paddingHorizontal={16} />
    <Style
      id="homepage-activity-pulse-text"
      fontSize={13}
      color="#45413a"
      textAlign="center"
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
