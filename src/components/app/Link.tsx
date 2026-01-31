import { ChildType } from "../../../types";

const Link = ({
  href,
  target,
  children,
  className,
}: {
  href: string;
  target?: string;
  children: ChildType;
  className?: string;
}) => (
  <a
    class={`font-medium underline-offset-2 hover:underline focus:underline focus:outline-hidden ${className}`}
    href={href}
    target={target}
  >
    {children}
  </a>
);
export default Link;
