import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import { capitalize } from "../../../utils.js";
import { HORIZONTAL_SLIDER_CARD_CLASS } from "../../../lib/horizontalSliderCardWidth.js";
const GroupCard = ({
  tag,
  href,
  coverUrl,
  widthClass = HORIZONTAL_SLIDER_CARD_CLASS
}) => /* @__PURE__ */ jsx(
  "div",
  {
    class: clsx("relative rounded-radius overflow-hidden shrink-0", widthClass),
    children: /* @__PURE__ */ jsxs("a", { href, class: "cursor-pointer block", children: [
      coverUrl ? /* @__PURE__ */ jsx(
        "img",
        {
          src: coverUrl,
          alt: "",
          width: 800,
          height: 256,
          loading: "lazy",
          decoding: "async",
          class: "w-full h-64 object-cover rounded-radius"
        }
      ) : /* @__PURE__ */ jsx("div", { class: "h-64 rounded-radius border-2 border-on-surface-strong bg-surface-alt" }),
      /* @__PURE__ */ jsx("div", { class: "absolute inset-0 flex flex-col gap-2 items-center justify-center bg-black/55 hover:bg-black/40 transition-all duration-300 p-4 text-white", children: /* @__PURE__ */ jsx("h3", { class: "font-display text-3xl font-medium leading-widest text-center text-balance", children: capitalize(tag) }) })
    ] })
  }
);
var GroupCard_default = GroupCard;
export {
  GroupCard_default as default
};
