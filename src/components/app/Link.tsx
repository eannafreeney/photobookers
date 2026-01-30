import { ChildType } from "../../../types";

const Link = ({
  href,
  target,
  children,
}: {
  href: string;
  target?: string;
  children: ChildType;
}) => (
  <a
    class="font-medium underline-offset-2 hover:underline focus:underline focus:outline-hidden "
    href={href}
    target={target}
  >
    {children}
  </a>
);
export default Link;
