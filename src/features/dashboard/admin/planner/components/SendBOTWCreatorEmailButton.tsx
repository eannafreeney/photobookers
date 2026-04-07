import Badge from "../../../../../components/app/Badge";
import Button from "../../../../../components/app/Button";
import FormPost from "../../../../../components/forms/FormPost";
import { BookOfTheWeek } from "../../../../../db/schema";
import { toWeekString } from "../../../../../lib/utils";
import { capitalize } from "../../../../../utils";

type Props = {
  recipientType: "artist" | "publisher";
  bookOfTheWeek: BookOfTheWeek;
  creatorId?: string;
  bookId: string;
};

const SendBOTWCreatorEmailButton = ({
  recipientType,
  bookOfTheWeek,
  creatorId,
  bookId,
}: Props) => {
  const emailSentAt =
    recipientType === "artist"
      ? bookOfTheWeek.artistEmailSentAt
      : bookOfTheWeek.publisherEmailSentAt;

  if (emailSentAt)
    return (
      <Badge variant="success">{`${capitalize(recipientType)} Email Sent`}</Badge>
    );

  return (
    <FormPost
      action={`/dashboard/admin/planner/book-of-the-week/send-creator-email`}
      x-target="toast modal-root"
    >
      <input type="hidden" name="creatorId" value={creatorId} />
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="recipientType" value={recipientType} />
      <input
        type="hidden"
        name="weekStart"
        value={toWeekString(bookOfTheWeek.weekStart)}
      />
      <Button variant="outline" color="primary" width="fit">
        Email {capitalize(recipientType)}
      </Button>
    </FormPost>
  );
};

export default SendBOTWCreatorEmailButton;
