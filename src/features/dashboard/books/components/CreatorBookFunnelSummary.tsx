import { CreatorType } from "../../../../db/schema";
import {
  formatClickRate,
  getCreatorCatalogueFunnelTotals,
} from "../../../book-analytics/funnel";

type Props = {
  creatorId: string;
  creatorType: CreatorType;
};

const CreatorBookFunnelSummary = async ({ creatorId, creatorType }: Props) => {
  const totals = await getCreatorCatalogueFunnelTotals(creatorId, creatorType);
  const clickRateLabel = formatClickRate(totals.views, totals.outboundClicks);

  return (
    <div class="rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface">
      <span class="font-semibold text-on-surface-strong">All time:</span>{" "}
      {totals.views.toLocaleString()} views ·{" "}
      {totals.favorites.toLocaleString()} Favorited ·{" "}
      {totals.outboundClicks.toLocaleString()} outbound clicks
      {clickRateLabel ? ` (${clickRateLabel} click rate)` : null}
    </div>
  );
};

export default CreatorBookFunnelSummary;
