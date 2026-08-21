import { createRoute } from "hono-fsr";
import {
  subscribeToActivityEvents
} from "../../../lib/activityEvents.js";
import {
  formatSseMessage,
  isBroadcastableActivityEvent
} from "../../../lib/activityStreamUtils.js";
const PING_INTERVAL_MS = 3e4;
const GET = createRoute((c) => {
  let unsubscribe = null;
  let closed = false;
  let pingInterval = null;
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const write = (chunk) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };
      const writeEvent = (event, data) => {
        write(formatSseMessage(event, data));
      };
      const onActivity = (activity) => {
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
        }
      });
    },
    cancel() {
      closed = true;
      if (pingInterval) clearInterval(pingInterval);
      unsubscribe?.();
      unsubscribe = null;
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
});
export {
  GET
};
