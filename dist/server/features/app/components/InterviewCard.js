import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import { formatDate } from "../../../utils.js";
import { HORIZONTAL_SLIDER_CARD_CLASS } from "../../../lib/horizontalSliderCardWidth.js";
const InterviewCard = ({
  interview,
  widthClass = HORIZONTAL_SLIDER_CARD_CLASS,
  link
}) => /* @__PURE__ */ jsx(
  "div",
  {
    class: clsx("relative rounded-radius overflow-hidden shrink-0", widthClass),
    children: /* @__PURE__ */ jsxs("a", { href: link, class: "cursor-pointer", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: interview.promoImageUrl ?? "",
          alt: `Interview with ${interview.creator.displayName}`,
          width: 800,
          height: 256,
          loading: "lazy",
          decoding: "async",
          class: "w-full h-64 object-cover rounded-radius"
        }
      ),
      /* @__PURE__ */ jsxs("div", { class: "absolute inset-0 flex flex-col gap-2 items-center justify-center bg-black/55 hover:bg-black/20 transition-all duration-300 p-4 text-white", children: [
        /* @__PURE__ */ jsx("p", { class: "kicker text-center text-white/70", children: "Interview" }),
        /* @__PURE__ */ jsx("h3", { class: "font-display text-3xl font-medium text-center text-balance", children: interview.creator.displayName }),
        /* @__PURE__ */ jsx("p", { class: "kicker text-center text-white/70", children: interview.completedAt ? formatDate(interview.completedAt) : "-" })
      ] })
    ] })
  }
);
var InterviewCard_default = InterviewCard;
export {
  InterviewCard_default as default
};
