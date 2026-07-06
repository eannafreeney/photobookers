import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getMessagesForFollower } from "../../../features/app/services.js";
import { AppLayout } from "../+layout.js";
import { hyperview } from "../../../lib/hxml.js";
import {
  messageListStyles,
  signInEmptyHintStyles
} from "../../../features/hyperview/hyperviewCommonScreenStyles.js";
import { Style, Text, View } from "../../../lib/hxml-comps.js";
import SignInPrompt, {
  signInPromptStyles
} from "../../../features/hyperview/components/SignInPrompt.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { formatDate, getUser } from "../../../utils.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  if (!user) {
    return hv(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: "Messages",
          showBackButton: false,
          showDock: true,
          baseUrl,
          extraStyles: pageStyles(),
          children: /* @__PURE__ */ jsx(
            SignInPrompt,
            {
              baseUrl,
              hint: "Sign in to see messages from creators you follow."
            }
          )
        }
      )
    );
  }
  const [, msgResult] = await getMessagesForFollower(user.id, 1, 20);
  const messages = msgResult?.messages ?? [];
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Messages",
        showBackButton: false,
        showDock: true,
        baseUrl,
        extraStyles: pageStyles(),
        children: /* @__PURE__ */ jsx(View, { style: "page-content", children: messages.length === 0 ? /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "No messages yet. Follow creators to see their updates here." }) : messages.map((m) => {
          const preview = m.body.length > 160 ? `${m.body.slice(0, 157)}\u2026` : m.body;
          return /* @__PURE__ */ jsxs(View, { style: "message-row", children: [
            /* @__PURE__ */ jsx(Text, { style: "message-from", children: m.creator?.displayName ?? "Creator" }),
            m.createdAt && /* @__PURE__ */ jsx(Text, { style: "message-date", children: formatDate(m.createdAt) }),
            /* @__PURE__ */ jsx(Text, { style: "message-preview", children: preview })
          ] }, m.id);
        }) })
      }
    )
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "page-content",
      marginRight: 16,
      marginLeft: 16,
      paddingBottom: 8
    }
  ),
  signInEmptyHintStyles(),
  signInPromptStyles(),
  messageListStyles()
] });
export {
  GET
};
