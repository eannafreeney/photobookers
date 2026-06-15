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
      class={clsx(
        "inline-flex items-center gap-1.5 border border-outline bg-surface-alt px-2 py-0.5 kicker text-on-surface",
        className,
      )}
      title={`${count.toLocaleString()} ${label}`}
    >
      <span class="text-on-surface-weak">{followersIcon}</span>
      <span class="tabular-nums text-on-surface-strong">
        {formatFollowerCount(count)}
      </span>
      <span class="text-on-surface-weak">{label}</span>
    </span>
  );
};

export default FollowersCount;
