export const HOMEPAGE_ACTIVITY_MIN_VIEWS = 30;

export type HomepageActivityStats = {
  bookViews: number;
  profileViews: number;
};

export function visibleHomepageActivityParts(stats: HomepageActivityStats) {
  return {
    showBooks: stats.bookViews >= HOMEPAGE_ACTIVITY_MIN_VIEWS,
    showProfiles: stats.profileViews >= HOMEPAGE_ACTIVITY_MIN_VIEWS,
  };
}
