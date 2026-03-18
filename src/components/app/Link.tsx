import clsx from "clsx";
import { ChildType } from "../../../types";

type LinkProps = {
  href: string;
  target?: string;
  children: ChildType;
  className?: string;
  hoverUnderline?: boolean;
};

const Link = ({
  href,
  target,
  children,
  className,
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
  >
    {children}
  </a>
);
export default Link;
