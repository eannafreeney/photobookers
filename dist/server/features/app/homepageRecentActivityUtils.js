import { getInitialsAvatar } from "../../lib/avatar.js";
function activityActorAvatarUrl(item) {
  const url = item.actorImageUrl?.trim();
  if (url) return url;
  const [firstName = "", lastName = ""] = item.actorName.trim().split(/\s+/);
  return getInitialsAvatar(firstName, lastName);
}
function formatActivityActorName(user) {
  const creatorName = user.creatorDisplayName?.trim();
  if (creatorName) return creatorName;
  const fullName = [user.firstName, user.lastName].map((part) => part?.trim()).filter(Boolean).join(" ");
  return fullName || "Someone";
}
function recentActivityVerb(type) {
  switch (type) {
    case "book_favourited":
      return "favourited";
    case "book_collected":
      return "collected";
    case "creator_followed":
      return "followed";
    case "book_commented":
      return "commented on";
  }
}
function resolveActivityImageUrl(url, resolvePublicUrl = (value) => value) {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  return resolvePublicUrl(trimmed);
}
function mergeRecentActivityItems(rows, limit = 10, resolvePublicUrl = (value) => value) {
  const withImages = [];
  for (const row of [...rows].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )) {
    const imageUrl = resolveActivityImageUrl(row.imageUrl, resolvePublicUrl);
    if (!imageUrl) continue;
    withImages.push({
      ...row,
      imageUrl,
      actorImageUrl: resolveActivityImageUrl(row.actorImageUrl, resolvePublicUrl)
    });
    if (withImages.length >= limit) break;
  }
  return withImages;
}
function serializeRecentActivityItems(items) {
  return items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString()
  }));
}
function shouldShowLiveActivityEvent(event, currentUserId) {
  if (currentUserId && event.actorId === currentUserId) return false;
  if (!event.targetImageUrl?.trim()) return false;
  if (!event.targetUrl?.trim()) return false;
  return true;
}
function liveActivityEventToStripItem(event) {
  const imageUrl = resolveActivityImageUrl(event.targetImageUrl);
  if (!imageUrl || !event.targetUrl?.trim()) return null;
  return {
    id: event.id,
    type: event.type,
    actorName: event.actorName?.trim() || "Someone",
    actorImageUrl: event.actorImageUrl ?? null,
    targetName: event.targetName,
    targetUrl: event.targetUrl,
    imageUrl,
    targetCreatorName: event.targetCreatorName,
    createdAt: event.createdAt
  };
}
function parseHomepageRecentActivityConfig(raw) {
  if (!raw) {
    return {
      items: [],
      currentUserId: null,
      hasMore: false,
      nextOffset: 0,
      pageSize: 10
    };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      currentUserId: parsed.currentUserId ?? null,
      hasMore: parsed.hasMore ?? false,
      nextOffset: parsed.nextOffset ?? parsed.items?.length ?? 0,
      pageSize: parsed.pageSize ?? 10
    };
  } catch {
    return {
      items: [],
      currentUserId: null,
      hasMore: false,
      nextOffset: 0,
      pageSize: 10
    };
  }
}
function formatRecentActivityAge(createdAt, nowMs = Date.now()) {
  const then = new Date(createdAt).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.floor((nowMs - then) / 1e3));
  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
export {
  activityActorAvatarUrl,
  formatActivityActorName,
  formatRecentActivityAge,
  liveActivityEventToStripItem,
  mergeRecentActivityItems,
  parseHomepageRecentActivityConfig,
  recentActivityVerb,
  resolveActivityImageUrl,
  serializeRecentActivityItems,
  shouldShowLiveActivityEvent
};
