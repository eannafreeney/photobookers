import clsx from "clsx";
import type { ChildType } from "../../../types";

type Props = {
  /** Small accent label above the title. */
  kicker?: string;
  children?: ChildType;
  /** Optional right-hand element, e.g. a "View All" link. */
  action?: ChildType;
  className?: string;
};

/**
 * The page's one section opener: a 2px rule in ink, a kicker, a display title.
 * Every top-level block uses this so the page reads as a single ruled stack —
 * thin `border-outline` rules are reserved for rows *inside* a section.
 */
const SectionHeader = ({ kicker, children, action, className }: Props) => (
  <div
    class={clsx("mb-6 border-t-2 border-on-surface-strong pt-3", className)}
  >
    <div class="flex items-end justify-between gap-4">
      <div class="flex min-w-0 flex-col gap-1">
        {kicker ? <span class="kicker text-accent">{kicker}</span> : null}
        {children ? (
          <h2 class="font-display text-2xl font-medium text-on-surface-strong">
            {children}
          </h2>
        ) : null}
      </div>
      {action ?? null}
    </div>
  </div>
);

export default SectionHeader;
