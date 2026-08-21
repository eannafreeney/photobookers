import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { mailIcon } from "../../../lib/icons.js";
import NewsletterForm from "./NewsletterForm.js";
import { NEWSLETTER_COPY } from "../../../constants/newsletter.js";
import {
  getNewsletterSubscriberCount,
  newsletterSubscriberLabel
} from "../../../domain/newsletters/subscribers.js";
import { toWeekStart } from "../../../lib/utils.js";
import { thisWeekPath } from "../spotlightUrls.js";
const lastIssuePath = () => {
  const lastWeek = toWeekStart(/* @__PURE__ */ new Date());
  lastWeek.setUTCDate(lastWeek.getUTCDate() - 7);
  return thisWeekPath(lastWeek);
};
const NewsletterCard = async () => {
  const subscriberLabel = newsletterSubscriberLabel(
    await getNewsletterSubscriberCount()
  );
  return /* @__PURE__ */ jsx(
    "div",
    {
      id: "newsletter-card",
      class: "overflow-hidden border-t-2 border-on-surface-strong bg-surface-alt p-5 sm:p-6",
      children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col 2xl:flex-row gap-4 md:items-center md:gap-6", children: [
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col md:flex-row min-w-0 items-start gap-4 md:flex-1", children: [
          /* @__PURE__ */ jsx("div", { class: "flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-accent border border-outline sm:size-11", children: mailIcon(5) }),
          /* @__PURE__ */ jsxs("div", { class: "min-w-0 flex-1 pt-0.5", children: [
            /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center gap-x-3 gap-y-1", children: [
              /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: NEWSLETTER_COPY.kicker }),
              subscriberLabel ? /* @__PURE__ */ jsx("span", { class: "kicker text-on-surface-weak", children: subscriberLabel }) : null
            ] }),
            /* @__PURE__ */ jsx("p", { class: "mt-1 font-display text-xl text-on-surface-strong", children: NEWSLETTER_COPY.title }),
            /* @__PURE__ */ jsx("p", { class: "mt-1 text-pretty text-xs leading-relaxed text-on-surface sm:text-sm", children: NEWSLETTER_COPY.banner }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: lastIssuePath(),
                class: "mt-2 inline-block text-xs underline decoration-accent underline-offset-4 transition-colors hover:text-on-surface-strong sm:text-sm",
                children: "See what was in last week's issue \u2192"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(NewsletterForm, { className: "w-full max-w-md" })
      ] })
    }
  );
};
var NewsletterCard_default = NewsletterCard;
export {
  NewsletterCard_default as default
};
