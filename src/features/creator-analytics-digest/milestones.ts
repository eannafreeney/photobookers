export const CREATOR_MILESTONE_KINDS = [
  "first_wishlist",
  "first_follower",
  "followers_10",
  "followers_50",
  "profile_views_50",
  "profile_views_100",
  "views_100",
  "views_500",
  "views_1000",
] as const;

export type CreatorMilestoneKind = (typeof CREATOR_MILESTONE_KINDS)[number];

export const MILESTONE_PRIORITY: CreatorMilestoneKind[] = [
  "first_wishlist",
  "first_follower",
  "profile_views_50",
  "profile_views_100",
  "views_100",
  "views_500",
  "views_1000",
  "followers_10",
  "followers_50",
];

export type CreatorMilestoneMetrics = {
  hasWishlist: boolean;
  hasOutboundClick: boolean;
  followerCount: number;
  profileViewCount: number;
  viewCount: number;
};

export function milestonesToCascadeMark(
  kind: CreatorMilestoneKind,
): CreatorMilestoneKind[] {
  switch (kind) {
    case "views_1000":
      return ["views_100", "views_500", "views_1000"];
    case "views_500":
      return ["views_100", "views_500"];
    case "followers_50":
      return ["first_follower", "followers_10", "followers_50"];
    case "followers_10":
      return ["first_follower", "followers_10"];
    case "profile_views_100":
      return ["profile_views_50", "profile_views_100"];
    default:
      return [kind];
  }
}

export function pickNextMilestone(
  sent: Set<string>,
  metrics: CreatorMilestoneMetrics,
): CreatorMilestoneKind | null {
  const candidates: CreatorMilestoneKind[] = [];

  if (metrics.hasWishlist && !sent.has("first_wishlist")) {
    candidates.push("first_wishlist");
  }
  if (metrics.followerCount >= 50 && !sent.has("followers_50")) {
    candidates.push("followers_50");
  } else if (metrics.followerCount >= 10 && !sent.has("followers_10")) {
    candidates.push("followers_10");
  } else if (metrics.followerCount >= 1 && !sent.has("first_follower")) {
    candidates.push("first_follower");
  }
  if (metrics.profileViewCount >= 100 && !sent.has("profile_views_100")) {
    candidates.push("profile_views_100");
  } else if (metrics.profileViewCount >= 50 && !sent.has("profile_views_50")) {
    candidates.push("profile_views_50");
  }
  if (metrics.viewCount >= 1000 && !sent.has("views_1000")) {
    candidates.push("views_1000");
  } else if (metrics.viewCount >= 500 && !sent.has("views_500")) {
    candidates.push("views_500");
  } else if (metrics.viewCount >= 100 && !sent.has("views_100")) {
    candidates.push("views_100");
  }

  for (const kind of MILESTONE_PRIORITY) {
    if (candidates.includes(kind)) return kind;
  }
  return null;
}

export function digestHasActivity(totals: {
  views: number;
  outboundClicks: number;
  favorites: number;
  newFollowers: number;
}): boolean {
  return (
    totals.views +
      totals.outboundClicks +
      totals.favorites +
      totals.newFollowers >
    0
  );
}
