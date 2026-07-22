import { NewsletterCampaign } from "@/db/schema";
import {
  NewsletterBrevoPanel,
  NewsletterCampaignControls,
} from "@/features/dashboard/admin/newsletters/components/NewsletterCampaignSendPanels";
import CampaignPreview from "./CampaignPreview";
import CampaignTextForm from "./CampaignTextForm";

type CampaignOverviewProps = {
  selectedCampaign: NewsletterCampaign;
  previewHtml: string;
  defaultTestEmail: string;
};

const CampaignOverview = ({
  selectedCampaign,
  previewHtml,
  defaultTestEmail,
}: CampaignOverviewProps) => (
  <div class="space-y-4">
    <NewsletterCampaignControls selectedCampaign={selectedCampaign} />
    <NewsletterBrevoPanel
      selectedCampaign={selectedCampaign}
      defaultTestEmail={defaultTestEmail}
    />
    <CampaignPreview previewHtml={previewHtml} />
    <div class="rounded border border-outline bg-surface p-4">
      <h2 class="text-lg font-semibold text-on-surface-strong">
        Edit draft copy
      </h2>
      <CampaignTextForm selectedCampaign={selectedCampaign} />
    </div>
  </div>
);

export default CampaignOverview;
