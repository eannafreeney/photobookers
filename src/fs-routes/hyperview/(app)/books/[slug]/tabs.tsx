import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../lib/hxml";
import { paramValidator } from "../../../../../lib/validator";
import { slugSchema } from "../../../../../features/app/schema";
import BookTabs, {
  BookTab,
} from "../../../../../features/hyperview/components/BookTabs";

const VALID_TABS: BookTab[] = ["book", "comments", "artist", "publisher"];

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const hv = hyperview(c);

  const proto = c.req.header("x-forwarded-proto") ?? "http";
  const host = c.req.header("host") ?? "localhost:5173";
  const baseUrl = `${proto}://${host}`;

  const activeParam = c.req.query("active") ?? "book";
  const activeTab = (
    VALID_TABS.includes(activeParam as BookTab) ? activeParam : "book"
  ) as BookTab;
  const hasPublisher = c.req.query("hasPublisher") === "true";

  return hv(
    <BookTabs
      baseUrl={baseUrl}
      slug={slug}
      hasPublisher={hasPublisher}
      activeTab={activeTab}
    />,
  );
});
