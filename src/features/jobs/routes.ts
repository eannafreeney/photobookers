import { Hono } from "hono";
import { cronNotifyFollowersNewBooks } from "./controllers";

export const jobsRoutes = new Hono();

jobsRoutes.post(
  "/cron/notify-followers-new-books",
  cronNotifyFollowersNewBooks,
);
