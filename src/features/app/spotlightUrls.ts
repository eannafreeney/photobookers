import { toDateString, toWeekString } from "../../lib/utils";

const appBaseUrl = process.env.PUBLIC_APP_URL ?? "https://www.photobookers.com";

export function botdIndexPath(): string {
  return "/book-of-the-day";
}

export function cotwIndexPath(isArtist: boolean): string {
  return isArtist ? "/artist-of-the-week" : "/publisher-of-the-week";
}

export function botdPath(date: Date): string {
  return `${botdIndexPath()}/${toDateString(date)}`;
}

export function aotwPath(weekStart: Date): string {
  return `/artist-of-the-week/${toWeekString(weekStart)}`;
}

export function potwPath(weekStart: Date): string {
  return `/publisher-of-the-week/${toWeekString(weekStart)}`;
}

export function botdUrl(date: Date): string {
  return `${appBaseUrl}${botdPath(date)}`;
}

export function aotwUrl(weekStart: Date): string {
  return `${appBaseUrl}${aotwPath(weekStart)}`;
}

export function potwUrl(weekStart: Date): string {
  return `${appBaseUrl}${potwPath(weekStart)}`;
}

export function thisWeekPath(weekStart?: Date): string {
  const qs = weekStart ? `?week=${toWeekString(weekStart)}` : "";
  return `/this-week${qs}`;
}
