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
          Fans have viewed{" "}
          <span class="font-semibold text-on-surface-strong">
            {bookViews.toLocaleString()}
          </span>{" "}
          books
        </>
      ) : null}
      {showBooks && showProfiles ? "," : null}
      {showProfiles ? (
        <>
          and{" "}
          <span class="font-semibold text-on-surface-strong">
            {profileViews.toLocaleString()}
          </span>{" "}
          artist &amp; publisher profiles
        </>
      ) : null}{" "}
      this week alone.
    </p>
  );
};

export default HomepageActivityPulse;
