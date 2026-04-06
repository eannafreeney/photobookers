import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { subscribeToActivityEvents } from "../../../lib/activityEvents";
import { streamSSE } from "hono/streaming";

export const GET = createRoute(async (c: Context) => {
  return streamSSE(c, async (stream) => {
    const unsubscribe = subscribeToActivityEvents((event) => {
      stream.writeSSE({
        event: "activity",
        data: JSON.stringify(event),
      });
    });

    // keepalive every 20s so proxies don't close idle stream
    const keepAlive = setInterval(() => {
      stream.writeSSE({
        event: "ping",
        data: "ok",
      });
    }, 20000);

    stream.onAbort(() => {
      clearInterval(keepAlive);
      unsubscribe();
    });

    // keep connection open
    await new Promise(() => {});
  });
});
