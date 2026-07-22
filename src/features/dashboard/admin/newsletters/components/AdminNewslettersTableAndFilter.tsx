import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll";
import Link from "../../../../../components/app/Link";
import Table from "../../../../../components/app/Table";
import FormPost from "../../../../../components/forms/FormPost";
import { deleteIcon, editIcon } from "../../../../../lib/icons";
import { NewsletterCampaign } from "../../../../../db/schema";
import {
  getNewsletterCampaignRange,
  listNewsletterCampaignsPaginated,
} from "../services";
import { formatNewsletterWeekRange } from "../utils";
import NewsletterStatusPill from "./NewsletterStatusPill";

type Props = {
  currentPage: number;
  currentPath: string;
};

const AdminNewslettersTableAndFilter = async ({
  currentPage,
  currentPath,
}: Props) => {
  const { campaigns, totalPages, page } =
    await listNewsletterCampaignsPaginated(currentPage);

  const targetId = "newsletters-table-body";

  return (
    <div x-data>
      <div id="newsletters-table-container" class="flex flex-col gap-4">
        <Table id="newsletters-table">
          <Table.Head>
            <tr>
              <Table.HeadRow>Week</Table.HeadRow>
              <Table.HeadRow>Status</Table.HeadRow>
              <Table.HeadRow>Sent</Table.HeadRow>
              <Table.HeadRow>Actions</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body id={targetId} xMerge="append">
            {campaigns.length === 0 ? (
              <tr>
                <Table.BodyRow>
                  <span class="text-on-surface">No newsletters yet.</span>
                </Table.BodyRow>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <NewslettersTableRow key={campaign.id} campaign={campaign} />
              ))
            )}
          </Table.Body>
        </Table>
        <InfiniteScroll
          baseUrl={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      </div>
    </div>
  );
};

export default AdminNewslettersTableAndFilter;

const NewslettersTableRow = ({
  campaign,
}: {
  campaign: NewsletterCampaign;
}) => {
  const { weekStart, weekEnd } = getNewsletterCampaignRange(campaign);
  const isSent = campaign.status === "sent";

  return (
    <tr>
      <Table.BodyRow>
        <Link href={`/dashboard/admin/newsletters/${campaign.id}`}>
          {formatNewsletterWeekRange(weekStart, weekEnd)}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        <NewsletterStatusPill status={campaign.status} />
      </Table.BodyRow>
      <Table.BodyRow>
        {campaign.sentAt ? campaign.sentAt.toLocaleDateString() : "–"}
      </Table.BodyRow>
      <Table.BodyRow>
        <div class="flex items-center gap-3">
          <a href={`/dashboard/admin/newsletters/${campaign.id}`}>
            <button class="cursor-pointer">{editIcon()}</button>
          </a>
          {!isSent && (
            <FormPost
              action={`/dashboard/admin/newsletters/${campaign.id}/delete`}
              onsubmit="return confirm('Delete this newsletter draft?')"
            >
              <button
                type="submit"
                class="cursor-pointer hover:text-red-500"
              >
                {deleteIcon}
              </button>
            </FormPost>
          )}
        </div>
      </Table.BodyRow>
    </tr>
  );
};
