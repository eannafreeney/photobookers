import clsx from "clsx";
import { followersIcon } from "../../lib/icons";

const followerLabel = (count: number) =>
  count === 1 ? "follower" : "followers";

const formatFollowerCount = (count: number) => {
  if (count >= 1_000_000) {
    const value = count / 1_000_000;
    return value >= 10
      ? `${Math.round(value)}M`
      : `${value.toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (count >= 10_000) {
    return `${Math.round(count / 1_000)}k`;
  }

  if (count >= 1_000) {
    const value = count / 1_000;
    return `${value.toFixed(1).replace(/\.0$/, "")}k`;
  }

  return count.toLocaleString();
};

type Props = {
  count: number;
  className?: string;
};

const FollowersCount = ({ count, className }: Props) => {
  if (count === 0) return null;

  const label = followerLabel(count);

  return (
    <span
      class={clsx("mt-1.5 inline-flex items-center gap-2", className)}
      title={`${count.toLocaleString()} ${label}`}
      aria-label={`${count.toLocaleString()} ${label}`}
    >
      <span
        class="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-alt text-on-surface-weak"
        aria-hidden="true"
      >
        {followersIcon}
      </span>
      <span class="inline-flex min-w-0 flex-col leading-none">
        <span class="font-display text-base font-medium tabular-nums text-on-surface-strong">
          {formatFollowerCount(count)}
        </span>
        <span class="kicker mt-0.5 text-on-surface-weak">{label}</span>
      </span>
    </span>
  );
};

export default FollowersCount;
