import Badge from "../../../../../components/app/Badge";
import Button from "../../../../../components/app/Button";
import FormPost from "../../../../../components/forms/FormPost";
import { ArtistOfTheWeek } from "../../../../../db/schema";
import { toWeekString } from "../../../../../lib/utils";

type Props = {
  artistOfTheWeek: ArtistOfTheWeek;
  creatorId?: string;
};

const SendAOTWCreatorEmailButton = ({ artistOfTheWeek, creatorId }: Props) => {
  if (artistOfTheWeek.emailSentAt)
    return <Badge variant="success">Email Sent</Badge>;

  return (
    <FormPost
      action={`/dashboard/admin/planner/artist-of-the-week/send-creator-email`}
      x-target="toast modal-root"
    >
      <input type="hidden" name="creatorId" value={creatorId} />
      <input
        type="hidden"
        name="weekStart"
        value={toWeekString(artistOfTheWeek.weekStart)}
      />
      <Button variant="outline" color="primary" width="fit">
        Email Artist
      </Button>
    </FormPost>
  );
};

export default SendAOTWCreatorEmailButton;
