import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Spinner, Style, Text, View } from "../../../lib/hxml-comps.js";
import { formatDate } from "../../../utils.js";
const FEATURED_MESSAGES_LOAD_MORE_ID = "featured-messages-load-more";
const MessagesList = ({
  messages,
  page = 1,
  hasMore = false,
  loadMoreHref
}) => /* @__PURE__ */ jsxs(Fragment, { children: [
  messages.map((m) => {
    const preview = m.body.length > 160 ? `${m.body.slice(0, 157)}\u2026` : m.body;
    return /* @__PURE__ */ jsxs(View, { style: "message-row", children: [
      /* @__PURE__ */ jsx(Text, { style: "message-from", children: m.creator?.displayName ?? "Creator" }),
      m.createdAt ? /* @__PURE__ */ jsx(Text, { style: "message-date", children: formatDate(m.createdAt) }) : null,
      /* @__PURE__ */ jsx(Text, { style: "message-preview", children: preview })
    ] }, m.id);
  }),
  hasMore && loadMoreHref ? /* @__PURE__ */ jsx(
    "view",
    {
      id: FEATURED_MESSAGES_LOAD_MORE_ID,
      style: "featured-tab-spinner",
      trigger: "visible",
      once: "true",
      verb: "get",
      href: `${loadMoreHref}?page=${page + 1}`,
      action: "replace",
      children: /* @__PURE__ */ jsx(Spinner, {})
    }
  ) : null
] });
var MessagesList_default = MessagesList;
const messagesListStyles = () => /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
  Style,
  {
    id: "featured-tab-spinner",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 16
  }
) });
export {
  FEATURED_MESSAGES_LOAD_MORE_ID,
  MessagesList_default as default,
  messagesListStyles
};
