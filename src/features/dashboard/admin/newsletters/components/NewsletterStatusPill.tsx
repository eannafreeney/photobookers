import Pill from "../../../../../components/app/Pill";
import { capitalize } from "../../../../../utils";
import { NewsletterCampaignStatus } from "../../../../../db/schema";

type Props = { status: NewsletterCampaignStatus };

const statusVariant = {
  draft: "warning",
  approved: "info",
  scheduled: "accent",
  sent: "success",
  failed: "danger",
} as const;

const NewsletterStatusPill = ({ status }: Props) => (
  <Pill variant={statusVariant[status] ?? "default"}>{capitalize(status)}</Pill>
);

export default NewsletterStatusPill;
