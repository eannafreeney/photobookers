import type { ActivityEvent } from "./activityEvents";

export function isBroadcastableActivityEvent(
  event: Pick<ActivityEvent, "targetImageUrl">,
): boolean {
  return Boolean(event.targetImageUrl?.trim());
}

export function formatSseMessage(event: string, data: string): string {
  return `event: ${event}\ndata: ${data}\n\n`;
}
