import Badge from "../../../../../components/app/Badge";
import Button from "../../../../../components/app/Button";
import FormPost from "../../../../../components/forms/FormPost";
import { PublisherOfTheWeek } from "../../../../../db/schema";
import { toWeekString } from "../../../../../lib/utils";

type Props = {
  publisherOfTheWeek: PublisherOfTheWeek;
  creatorId?: string;
};

const SendPOTWCreatorEmailButton = ({
  publisherOfTheWeek,
  creatorId,
}: Props) => {
  if (publisherOfTheWeek.emailSentAt)
    return <Badge variant="success">Email Sent</Badge>;

  return (
    <FormPost
      action={`/dashboard/admin/planner/publisher-of-the-week/send-creator-email`}
      x-target="toast modal-root"
    >
      <input type="hidden" name="creatorId" value={creatorId} />
      <input
        type="hidden"
        name="weekStart"
        value={toWeekString(publisherOfTheWeek.weekStart)}
      />
      <Button variant="outline" color="primary" width="fit">
        Email Publisher
      </Button>
    </FormPost>
  );
};

export default SendPOTWCreatorEmailButton;
