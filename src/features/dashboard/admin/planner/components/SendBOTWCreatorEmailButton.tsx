import Badge from "../../../../../components/app/Badge";
import Button from "../../../../../components/app/Button";
import FormPost from "../../../../../components/forms/FormPost";
import { BookOfTheWeek } from "../../../../../db/schema";
import { toWeekString } from "../../../../../lib/utils";
import { capitalize } from "../../../../../utils";
import ToggleButton from "./ToggleButton";

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

  const isSent = Boolean(emailSentAt);
  const id = `botw-email-${bookOfTheWeek.id}-${recipientType}`;

  const alpineAttrs = {
    "x-target": `${id} toast modal-root`,
    "x-target.error": "toast",
    "x-on:ajax:error":
      "($el.querySelector('input[type=checkbox]') as HTMLInputElement).checked = false",
  };

  return (
    <FormPost
      id={id}
      action={`/dashboard/admin/planner/book-of-the-week/send-creator-email`}
      {...alpineAttrs}
    >
      <input type="hidden" name="creatorId" value={creatorId} />
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="recipientType" value={recipientType} />
      <input
        type="hidden"
        name="weekStart"
        value={toWeekString(bookOfTheWeek.weekStart)}
      />
      <ToggleButton isSent={isSent} recipientType={recipientType} />
    </FormPost>
  );
};

export default SendBOTWCreatorEmailButton;
