import { createRoute } from "hono-fsr";
import {
  subscribeToActivityEvents,
  type ActivityEvent,
} from "../../../lib/activityEvents";
import {
  formatSseMessage,
  isBroadcastableActivityEvent,
} from "../../../lib/activityStreamUtils";

const PING_INTERVAL_MS = 30_000;

export const GET = createRoute((c) => {
  let unsubscribe: (() => void) | null = null;
  let closed = false;
  let pingInterval: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const write = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };

      const writeEvent = (event: string, data: string) => {
        write(formatSseMessage(event, data));
      };

      const onActivity = (activity: ActivityEvent) => {
        if (!isBroadcastableActivityEvent(activity)) return;
        writeEvent("activity", JSON.stringify(activity));
      };

      unsubscribe = subscribeToActivityEvents(onActivity);
      writeEvent("ping", "");

      pingInterval = setInterval(() => {
        if (closed) return;
        writeEvent("ping", "");
      }, PING_INTERVAL_MS);

      c.req.raw.signal.addEventListener("abort", () => {
        closed = true;
        if (pingInterval) clearInterval(pingInterval);
        unsubscribe?.();
        unsubscribe = null;
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      closed = true;
      if (pingInterval) clearInterval(pingInterval);
      unsubscribe?.();
      unsubscribe = null;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
});
