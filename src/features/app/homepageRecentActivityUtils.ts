export type RecentActivityType =
  | "book_favourited"
  | "book_collected"
  | "creator_followed"
  | "book_commented";

export type RecentActivityItem = {
  id: string;
  type: RecentActivityType;
  targetName: string;
  targetUrl: string;
  imageUrl: string;
  targetCreatorName?: string;
  createdAt: Date;
};

type RawActivityRow = Omit<RecentActivityItem, "imageUrl"> & {
  imageUrl: string | null;
};

export function resolveActivityImageUrl(
  url: string | null | undefined,
  resolvePublicUrl: (url: string) => string = (value) => value,
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  return resolvePublicUrl(trimmed);
}

export function mergeRecentActivityItems(
  rows: RawActivityRow[],
  limit = 10,
  resolvePublicUrl: (url: string) => string = (value) => value,
): RecentActivityItem[] {
  const withImages: RecentActivityItem[] = [];

  for (const row of [...rows].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )) {
    const imageUrl = resolveActivityImageUrl(row.imageUrl, resolvePublicUrl);
    if (!imageUrl) continue;
    withImages.push({ ...row, imageUrl });
    if (withImages.length >= limit) break;
  }

  return withImages;
}

export function recentActivityTrailingText(type: RecentActivityType): string {
  switch (type) {
    case "book_favourited":
      return " was added to favourites";
    case "book_collected":
      return " was added to a collection";
    case "creator_followed":
      return " was followed";
    case "book_commented":
      return " was commented on";
  }
}
