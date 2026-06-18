import { CreatorType } from "../../../../db/schema";
import { getCreatorPurchaseClickTotal } from "../../../purchase-clicks/services";

type Props = {
  creatorId: string;
  creatorType: CreatorType;
};

const CreatorPurchaseClickSummary = async ({
  creatorId,
  creatorType,
}: Props) => {
  const totalClicks = await getCreatorPurchaseClickTotal(
    creatorId,
    creatorType,
  );

  return (
    <div class="rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface">
      <span class="font-semibold text-on-surface-strong">
        Outbound clicks (all time):
      </span>{" "}
      {totalClicks} across your catalogue
    </div>
  );
};

export default CreatorPurchaseClickSummary;
