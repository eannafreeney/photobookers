import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { buildBotdEmailBadgeProps } from "../emailBadgeBuilders.js";
import EmailStatusBadge from "./EmailStatusBadge.js";
const BotdEmailStatusBadges = ({ bookOfTheDay }) => {
  const book = bookOfTheDay.book;
  if (!book) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1.5", children: [
    book.artist && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        EmailStatusBadge,
        {
          ...buildBotdEmailBadgeProps({
            bookOfTheDay,
            recipientType: "artist",
            emailKind: "advance"
          })
        }
      ),
      /* @__PURE__ */ jsx(
        EmailStatusBadge,
        {
          ...buildBotdEmailBadgeProps({
            bookOfTheDay,
            recipientType: "artist",
            emailKind: "feature_day"
          })
        }
      )
    ] }),
    book.publisher && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        EmailStatusBadge,
        {
          ...buildBotdEmailBadgeProps({
            bookOfTheDay,
            recipientType: "publisher",
            emailKind: "advance"
          })
        }
      ),
      /* @__PURE__ */ jsx(
        EmailStatusBadge,
        {
          ...buildBotdEmailBadgeProps({
            bookOfTheDay,
            recipientType: "publisher",
            emailKind: "feature_day"
          })
        }
      )
    ] })
  ] });
};
var BotdEmailStatusBadges_default = BotdEmailStatusBadges;
export {
  BotdEmailStatusBadges_default as default
};
