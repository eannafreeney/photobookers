import { toDateString, toWeekString } from "../../lib/utils";

// app

function appBaseUrl(): string {
  if (typeof process !== "undefined" && process.env.PUBLIC_APP_URL) {
    return process.env.PUBLIC_APP_URL;
  }
  return "https://www.photobookers.com";
}

export function bookPath(slug: string): string {
  return `/books/${slug}`;
}

export function creatorPath(slug: string): string {
  return `/creators/${slug}`;
}

export function bookUrl(slug: string): string {
  return `${appBaseUrl()}${bookPath(slug)}`;
}

export function creatorUrl(slug: string): string {
  return `${appBaseUrl()}${creatorPath(slug)}`;
}

export function fairPath(slug: string): string {
  return `/fairs/${slug}`;
}

export function fairUrl(slug: string): string {
  return `${appBaseUrl()}${fairPath(slug)}`;
}

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
  return `${appBaseUrl()}${botdPath(date)}`;
}

export function aotwUrl(weekStart: Date): string {
  return `${appBaseUrl()}${aotwPath(weekStart)}`;
}

export function potwUrl(weekStart: Date): string {
  return `${appBaseUrl()}${potwPath(weekStart)}`;
}

export function thisWeekPath(weekStart?: Date): string {
  const qs = weekStart ? `?week=${toWeekString(weekStart)}` : "";
  return `/this-week${qs}`;
}

export function thisWeekUrl(weekStart?: Date): string {
  return `${appBaseUrl()}${thisWeekPath(weekStart)}`;
}

export function linksPath(): string {
  return "/links";
}

export function linksUrl(): string {
  return `${appBaseUrl()}${linksPath()}`;
}
