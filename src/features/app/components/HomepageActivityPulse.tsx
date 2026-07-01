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
    <p class="mb-8 text-center text-sm text-on-surface text-pretty">
      This week on Photobookers —
      {showBooks ? (
        <>
          {" "}
          <span class="font-semibold text-on-surface-strong">
            {bookViews.toLocaleString()}
          </span>{" "}
          books explored
        </>
      ) : null}
      {showBooks && showProfiles ? "," : null}
      {showProfiles ? (
        <>
          {" "}
          <span class="font-semibold text-on-surface-strong">
            {profileViews.toLocaleString()}
          </span>{" "}
          artist &amp; publisher profile visits
        </>
      ) : null}
    </p>
  );
};

export default HomepageActivityPulse;
