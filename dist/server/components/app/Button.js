import { jsx } from "hono/jsx/jsx-runtime";
import { tv } from "tailwind-variants";
import { colorMap } from "../../lib/colorMap.js";
const button = tv({
  base: `
    whitespace-nowrap rounded-radius px-5 py-2.5
    text-xs font-semibold uppercase tracking-[0.16em] text-center
    transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2
    active:opacity-100 active:outline-offset-0 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer
  `,
  variants: {
    variant: {
      solid: "",
      outline: "bg-transparent",
      ghost: "bg-transparent"
    },
    // color: Object.keys(colorMap) as (keyof typeof colorMap)[],
    color: Object.fromEntries(
      Object.keys(colorMap).map((key) => [
        key,
        ""
      ])
    ),
    width: {
      full: "w-full",
      auto: "w-auto",
      fit: "w-fit",
      sm: "w-24",
      md: "w-32",
      lg: "w-48",
      xl: "w-64"
    }
  },
  defaultVariants: {
    variant: "solid",
    color: "primary",
    width: "full"
  },
  compoundVariants: [
    ...Object.entries(colorMap).flatMap(([color, styles]) => [
      { variant: "solid", color, class: styles.solid },
      { variant: "outline", color, class: styles.outline },
      { variant: "ghost", color, class: styles.ghost }
    ])
  ]
});
function Button({
  variant,
  color,
  width = "full",
  children,
  type = "submit",
  isDisabled = false,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type,
      class: button({ variant, color, width }),
      disabled: isDisabled,
      ...props,
      children
    }
  );
}
export {
  Button as default
};
