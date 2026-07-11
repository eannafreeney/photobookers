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
          This week:{" "}
          <span class="font-semibold text-on-surface-strong">
            {bookViews.toLocaleString()}
          </span>{" "}
          book views
        </>
      ) : null}
      {showBooks && showProfiles ? "," : null}
      {showProfiles ? (
        <>
          and{" "}
          <span class="font-semibold text-on-surface-strong">
            {profileViews.toLocaleString()}
          </span>{" "}
          creator profiles views
        </>
      ) : null}
    </p>
  );
};

export default HomepageActivityPulse;
