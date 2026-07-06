import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
const SpotlightCard = ({
  href,
  imageUrl,
  imageAlt,
  title,
  dateLabel,
  subtitle,
  aspectSquare = false,
  className
}) => {
  return /* @__PURE__ */ jsxs(
    "a",
    {
      href,
      class: clsx(
        "group flex flex-col border border-outline bg-surface transition-colors duration-300 hover:border-on-surface-strong",
        className ?? "min-w-[200px] max-w-[24rem]"
      ),
      children: [
        dateLabel ? /* @__PURE__ */ jsx("div", { class: "flex items-center justify-center gap-2 border-b border-outline px-3 py-2", children: /* @__PURE__ */ jsx("span", { class: "kicker text-accent whitespace-nowrap", children: dateLabel }) }) : null,
        /* @__PURE__ */ jsx(
          "figure",
          {
            class: clsx(
              "relative w-full overflow-hidden bg-surface-alt",
              aspectSquare ? "aspect-square" : "aspect-[1]"
            ),
            children: /* @__PURE__ */ jsx(
              "img",
              {
                src: imageUrl,
                alt: imageAlt,
                loading: "lazy",
                class: "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1 px-3 py-3", children: [
          /* @__PURE__ */ jsx("h3", { class: "font-display text-lg font-medium leading-snug text-on-surface-strong decoration-accent decoration-2 underline-offset-4 group-hover:underline", children: title }),
          subtitle ? /* @__PURE__ */ jsx("p", { class: "kicker text-on-surface-weak", children: subtitle }) : null
        ] })
      ]
    }
  );
};
var SpotlightCard_default = SpotlightCard;
export {
  SpotlightCard_default as default
};
