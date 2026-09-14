import { Style, Text, View } from "../../../lib/hxml-comps";
import {
  visibleHomepageActivityParts,
  type HomepageActivityStats,
} from "../../app/homepageActivityVisibility";

const HomepageActivityPulse = ({
  bookViews,
  profileViews,
  buyClicks,
}: HomepageActivityStats) => {
  const { showBooks, showProfiles, showClicks } = visibleHomepageActivityParts({
    bookViews,
    profileViews,
    buyClicks,
  });
  if (!showBooks && !showProfiles && !showClicks) return null;

  const showViews = showBooks || showProfiles;
  const views = (
    <>
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
    </>
  );
  const clicks = (
    <>
      <Text style="homepage-activity-pulse-emphasis">
        {buyClicks.toLocaleString()}
      </Text>
      {" clicks through to buy"}
    </>
  );

  return (
    <View style="homepage-activity-pulse">
      <Text style="homepage-activity-pulse-text">
        {showViews && showClicks ? (
          <>
            {views} this week — and {clicks}.
          </>
        ) : null}
        {showViews && !showClicks ? <>{views} this week alone.</> : null}
        {!showViews && showClicks ? <>{clicks} this week alone.</> : null}
      </Text>
    </View>
  );
};

export default HomepageActivityPulse;

export const homepageActivityPulseStyles = () => (
  <>
    <Style id="homepage-activity-pulse" paddingHorizontal={16} width="100%" />
    <Style
      id="homepage-activity-pulse-text"
      fontSize={13}
      color="#45413a"
      textAlign="center"
      lineHeight={18}
      width="100%"
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
