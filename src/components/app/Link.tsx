import clsx from "clsx";
import { ChildType } from "../../../types";

type LinkProps = {
  href: string;
  target?: string;
  children: ChildType;
  className?: string;
  hoverUnderline?: boolean;
  xTarget?: string;
};

const Link = ({
  href,
  target,
  children,
  className,
  xTarget,
  hoverUnderline = false,
}: LinkProps) => (
  <a
    class={clsx(
      "font-medium underline-offset-2 focus:underline focus:outline-hidden",
      className,
      hoverUnderline && "hover:underline",
    )}
    href={href}
    target={target}
    x-target={xTarget}
  >
    {children}
  </a>
);
export default Link;
