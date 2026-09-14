import { getHomepageActivityStats } from "../homepageActivity";
import { visibleHomepageActivityParts } from "../homepageActivityVisibility";

const HomepageActivityPulse = async () => {
  const [error, stats] = await getHomepageActivityStats();
  if (error || !stats) return <></>;

  const { showBooks, showProfiles, showClicks } =
    visibleHomepageActivityParts(stats);
  if (!showBooks && !showProfiles && !showClicks) return <></>;

  const showViews = showBooks || showProfiles;
  const views = (
    <>
      {showBooks ? (
        <>
          <span class="font-semibold text-on-surface-strong">
            {stats.bookViews.toLocaleString()}
          </span>{" "}
          book views
        </>
      ) : null}
      {showBooks && showProfiles ? " and " : null}
      {showProfiles ? (
        <>
          <span class="font-semibold text-on-surface-strong">
            {stats.profileViews.toLocaleString()}
          </span>{" "}
          creator profile views
        </>
      ) : null}
    </>
  );
  const clicks = (
    <>
      <span class="font-semibold text-on-surface-strong">
        {stats.buyClicks.toLocaleString()}
      </span>{" "}
      clicks through to buy
    </>
  );

  return (
    <p class="text-md text-on-surface-weak text-pretty text-center">
      {showViews && showClicks ? (
        <>
          {views} this week — and {clicks}.
        </>
      ) : null}
      {showViews && !showClicks ? <>{views} this week alone.</> : null}
      {!showViews && showClicks ? <>{clicks} this week alone.</> : null}
    </p>
  );
};

export default HomepageActivityPulse;
