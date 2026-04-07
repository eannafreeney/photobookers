import Badge from "../../../../../components/app/Badge";
import Button from "../../../../../components/app/Button";
import FormPost from "../../../../../components/forms/FormPost";
import { toWeekString } from "../../../../../lib/utils";
import { capitalize } from "../../../../../utils";
import { FeaturedBookOfTheWeekWithBook } from "../services";

type Props = {
  featuredBook: FeaturedBookOfTheWeekWithBook;
  creatorId?: string;
  bookId: string;
  recipientType: "artist" | "publisher";
};

const SendFeaturedBookEmailButton = ({
  featuredBook,
  creatorId,
  bookId,
  recipientType,
}: Props) => {
  const emailSentAt =
    recipientType === "artist"
      ? featuredBook.artistEmailSentAt
      : featuredBook.publisherEmailSentAt;

  if (emailSentAt)
    return (
      <Badge variant="success">{`${capitalize(recipientType)} Email Sent`}</Badge>
    );

  return (
    <FormPost
      action={`/dashboard/admin/planner/featured/send-creator-email`}
      x-target="toast modal-root"
    >
      <input type="hidden" name="creatorId" value={creatorId} />
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="recipientType" value={recipientType} />
      <input
        type="hidden"
        name="weekStart"
        value={toWeekString(featuredBook.weekStart)}
      />
      <Button variant="outline" color="primary" width="fit">
        Email {capitalize(recipientType)}
      </Button>
    </FormPost>
  );
};

export default SendFeaturedBookEmailButton;
