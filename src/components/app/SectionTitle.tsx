import clsx from "clsx";
import { ChildType } from "../../../types";

type SectionTitleProps = {
  children: string | ChildType;
  className?: string;
};

const SectionTitle = ({ children, className = "mb-4" }: SectionTitleProps) => (
  <h2 class={clsx("flex items-center gap-2 text-lg font-bold", className)}>
    {children}
  </h2>
);

export default SectionTitle;
