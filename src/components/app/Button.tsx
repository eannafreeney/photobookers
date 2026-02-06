import { tv } from "tailwind-variants";
import { colorMap } from "../../lib/colorMap";
import { JSX, JSXNode, PropsWithChildren } from "hono/jsx";

const button = tv({
  base: `
    whitespace-nowrap rounded-radius px-4 py-2
    text-sm font-medium tracking-wide text-center
    transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2
    active:opacity-100 active:outline-offset-0 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer
  `,
  variants: {
    variant: {
      solid: "",
      outline: "bg-transparent",
    },
    color: Object.keys(colorMap),
    width: {
      full: "w-full",
      auto: "w-auto",
      fit: "w-fit",
      sm: "w-24",
      md: "w-32",
      lg: "w-48",
      xl: "w-64",
    },
  },
  defaultVariants: {
    variant: "solid",
    color: "primary",
    width: "full",
  },
  compoundVariants: [
    ...Object.entries(colorMap).flatMap(([color, styles]) => [
      { variant: "solid", color, class: styles.solid },
      { variant: "outline", color, class: styles.outline },
      { variant: "ghost", color, class: styles.ghost },
    ]),
  ],
});

type ButtonProps = PropsWithChildren<{
  variant: "solid" | "outline" | "ghost";
  color: keyof typeof colorMap;
  isDisabled?: boolean;
  width?: "full" | "auto" | "fit" | "sm" | "md" | "lg" | "xl";
  type?: "button" | "submit" | "reset";
  [key: string]: any;
}>;

export default function Button({
  variant,
  color,
  width = "full",
  children,
  type = "submit",
  isDisabled = false,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      class={button({ variant, color, width })}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  );
}
