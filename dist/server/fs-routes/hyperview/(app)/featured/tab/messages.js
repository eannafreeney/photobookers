import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getMessagesForFollower } from "../../../../../features/app/services.js";
import MessagesList from "../../../../../features/hyperview/components/MessagesList.js";
import { hyperview } from "../../../../../lib/hxml.js";
import { Text } from "../../../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../../../lib/hyperview.js";
import { getUser } from "../../../../../utils.js";
import SignInPrompt from "../../../../../features/hyperview/components/SignInPrompt.js";
import ErrorScreen from "../../../../../features/hyperview/components/ErrorScreen.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const user = await getUser(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const baseUrl = getBaseUrl(c);
  const loadMoreHref = `${baseUrl}/hyperview/featured/tab/messages`;
  if (!user) {
    return hv(
      /* @__PURE__ */ jsx(
        SignInPrompt,
        {
          variant: "fragment",
          baseUrl,
          hint: "Sign in to see messages from creators you follow."
        }
      )
    );
  }
  const [error, msgResult] = await getMessagesForFollower(
    user.id,
    currentPage,
    10
  );
  if (error) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: error.reason })
    );
  }
  const messages = msgResult?.messages ?? [];
  const totalPages = msgResult?.totalPages ?? 1;
  const hasMore = currentPage < totalPages;
  if (currentPage === 1 && messages.length === 0) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "No messages yet. Follow creators to see their updates here." }) })
    );
  }
  return hv(
    /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(
      MessagesList,
      {
        messages,
        page: currentPage,
        hasMore,
        loadMoreHref
      }
    ) })
  );
});
export {
  GET
};
