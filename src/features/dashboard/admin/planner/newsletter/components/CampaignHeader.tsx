import { NewsletterCampaign } from "@/db/schema";
import { getNewsletterCampaignRange } from "@/features/dashboard/admin/planner/newsletter/services";
import { formatNewsletterWeekRange } from "@/features/dashboard/admin/planner/newsletter/utils";

type CampaignHeaderProps = {
  selectedCampaign: NewsletterCampaign;
};

const CampaignHeader = ({ selectedCampaign }: CampaignHeaderProps) => {
  const { weekStart, weekEnd } = getNewsletterCampaignRange(selectedCampaign);

  return (
    <div class="mb-6 flex items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-on-surface-strong">
          Weekly BOTD newsletter
        </h1>
        <p class="mb-3 text-sm text-on-surface">
          Edition: {formatNewsletterWeekRange(weekStart, weekEnd)}
        </p>
        <p class="text-sm text-on-surface">
          Edit copy, preview the email, send a Brevo test, then send to your
          list when ready. You can still copy HTML manually if needed.
        </p>
      </div>
    </div>
  );
};

export default CampaignHeader;
