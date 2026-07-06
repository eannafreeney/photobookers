const HOMEPAGE_ACTIVITY_MIN_VIEWS = 30;
function visibleHomepageActivityParts(stats) {
  return {
    showBooks: stats.bookViews >= HOMEPAGE_ACTIVITY_MIN_VIEWS,
    showProfiles: stats.profileViews >= HOMEPAGE_ACTIVITY_MIN_VIEWS
  };
}
export {
  HOMEPAGE_ACTIVITY_MIN_VIEWS,
  visibleHomepageActivityParts
};
