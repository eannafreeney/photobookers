import {
  visibleHomepageActivityParts,
  type HomepageActivityStats,
} from "../homepageActivityVisibility";

type Props = HomepageActivityStats & {
  /** Override when the line sits inside another block (e.g. the live strip header). */
  className?: string;
};

const HomepageActivityPulse = ({
  bookViews,
  profileViews,
  className = "text-center text-sm text-on-surface text-pretty",
}: Props) => {
  const { showBooks, showProfiles } = visibleHomepageActivityParts({
    bookViews,
    profileViews,
  });
  if (!showBooks && !showProfiles) return null;

  return (
    <p class={className}>
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
          creator profile views
        </>
      ) : null}{" "}
      this week alone.
    </p>
  );
};

export default HomepageActivityPulse;
