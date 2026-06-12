import clsx from "clsx";
import { ChildType } from "../../../types";

type SectionTitleProps = {
  children: string | ChildType;
  className?: string;
  kicker?: string;
};

const SectionTitle = ({
  children,
  className = "mb-2",
  kicker,
}: SectionTitleProps) => {
  const headingClass =
    "flex items-center gap-2 font-display text-2xl font-medium text-on-surface-strong";

  if (!kicker) {
    return <h2 class={clsx(headingClass, className)}>{children}</h2>;
  }

  return (
    <div class={clsx("flex flex-col gap-1 mt-4", className)}>
      <span class="kicker text-accent">{kicker}</span>
      <h2 class={headingClass}>{children}</h2>
    </div>
  );
};

export default SectionTitle;
