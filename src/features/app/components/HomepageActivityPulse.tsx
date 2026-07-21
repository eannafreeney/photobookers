import {
  visibleHomepageActivityParts,
  type HomepageActivityStats,
} from "../homepageActivityVisibility";

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
    <p class="text-center text-sm text-on-surface text-pretty">
      {showBooks ? (
        <>
          <span class="font-semibold text-on-surface-strong">
            {bookViews.toLocaleString()}
          </span>{" "}
          book views
        </>
      ) : null}
      {showBooks && showProfiles ? " and " : null}
      {showProfiles ? (
        <>
          <span class="font-semibold text-on-surface-strong">
            {profileViews.toLocaleString()}
          </span>{" "}
          creator profiles views
        </>
      ) : null}{" "}
      this week alone.
    </p>
  );
};

export default HomepageActivityPulse;
