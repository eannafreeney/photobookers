import Badge from "../../../../../components/app/Badge";
import Button from "../../../../../components/app/Button";
import FormPost from "../../../../../components/forms/FormPost";
import { toWeekString } from "../../../../../lib/utils";
import { capitalize } from "../../../../../utils";
import ToggleButton from "./ToggleButton";

type FeaturedEmailRow = {
  id: string;
  weekStart: Date;
  artistEmailSentAt: Date | null;
  publisherEmailSentAt: Date | null;
};

type Props = {
  featuredBook: FeaturedEmailRow;
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

  const isSent = Boolean(emailSentAt);
  const id = `featured-email-${featuredBook.id}-${recipientType}`;

  const alpineAttrs = {
    "x-target": `${id} toast modal-root`,
    "x-target.error": "toast",
    "x-on:ajax:error":
      "($el.querySelector('input[type=checkbox]') as HTMLInputElement).checked = false",
  };

  return (
    <FormPost
      id={id}
      action={`/dashboard/admin/planner/featured/send-creator-email`}
      {...alpineAttrs}
    >
      <input type="hidden" name="creatorId" value={creatorId} />
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="recipientType" value={recipientType} />
      <input type="hidden" name="featuredId" value={featuredBook.id} />
      <input
        type="hidden"
        name="weekStart"
        value={toWeekString(featuredBook.weekStart)}
      />
      <ToggleButton isSent={isSent} recipientType={recipientType} />
    </FormPost>
  );
};

export default SendFeaturedBookEmailButton;
