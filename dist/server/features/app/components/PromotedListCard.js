import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import { HORIZONTAL_SLIDER_CARD_CLASS } from "../../../lib/horizontalSliderCardWidth.js";
const PromotedListCard = ({
  list,
  widthClass = HORIZONTAL_SLIDER_CARD_CLASS
}) => {
  const href = `/shelf/${list.owner.shelfSlug}/lists/${list.slug}`;
  const covers = list.coverUrls.slice(0, 3);
  return /* @__PURE__ */ jsxs(
    "a",
    {
      href,
      class: clsx(
        "relative block overflow-hidden rounded-radius border border-outline bg-surface-alt shrink-0",
        widthClass
      ),
      children: [
        /* @__PURE__ */ jsx("div", { class: "grid h-48 grid-cols-3 gap-0.5 bg-surface", children: covers.length === 0 ? /* @__PURE__ */ jsx("div", { class: "col-span-3 flex items-center justify-center text-sm text-on-surface-weak", children: "List" }) : covers.map((url, i) => /* @__PURE__ */ jsx(
          "img",
          {
            src: url,
            alt: "",
            class: clsx(
              "h-full w-full object-cover",
              covers.length === 1 && "col-span-3",
              covers.length === 2 && i === 0 && "col-span-2"
            ),
            loading: "lazy",
            decoding: "async"
          }
        )) }),
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1 p-4", children: [
          /* @__PURE__ */ jsx("p", { class: "kicker text-on-surface-weak", children: "List" }),
          /* @__PURE__ */ jsx("h3", { class: "font-display text-xl font-medium text-on-surface-strong text-balance line-clamp-2", children: list.title }),
          /* @__PURE__ */ jsxs("p", { class: "text-sm text-on-surface", children: [
            list.owner.displayName,
            /* @__PURE__ */ jsxs("span", { class: "text-on-surface-weak", children: [
              " ",
              "\xB7 ",
              list.bookCount,
              " ",
              list.bookCount === 1 ? "book" : "books"
            ] })
          ] })
        ] })
      ]
    }
  );
};
var PromotedListCard_default = PromotedListCard;
export {
  PromotedListCard_default as default
};
