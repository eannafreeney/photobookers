import type { StubOutreachStats } from "../../../domain/creators/stubOutreachStats";

type Props = {
  stats: StubOutreachStats;
};

const statRows = (stats: StubOutreachStats) => [
  { label: "Book views (last 30 days)", value: stats.views },
  { label: "Outbound buy clicks", value: stats.outboundClicks },
  { label: "Favorited", value: stats.favorites },
];

const ClaimStatsPreview = ({ stats }: Props) => {
  const hasActivity = statRows(stats).some((row) => row.value > 0);

  if (!hasActivity) return <></>;

  return (
    <div class="flex flex-col gap-3 rounded-radius border border-outline bg-surface p-5">
      <p class="font-medium text-on-surface-strong">Your traffic so far</p>
      <ul class="flex flex-col gap-2">
        {statRows(stats).map((row) => (
          <li
            key={row.label}
            class="list-none flex items-center justify-between gap-4 text-sm"
          >
            <span class="text-on-surface-weak">{row.label}</span>
            <span class="select-none blur-sm">{row.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
      {stats.topBookTitle && stats.topBookViews > 0 ? (
        <p class="text-sm text-on-surface-weak">
          Top book lately:{" "}
          <span class="select-none blur-sm">{stats.topBookTitle}</span>
        </p>
      ) : null}
      <p class="text-sm text-on-surface">
        Claim your profile to unlock full analytics and see which books drove
        these clicks.
      </p>
    </div>
  );
};

export default ClaimStatsPreview;
