import FormPost from "../../../../../components/forms/FormPost";
import { BookOfTheDay } from "../../../../../db/schema";
import { normalizeStoredDate, toDateString } from "../../../../../lib/utils";
import { formatDayLabel } from "../utils";
import ToggleButton from "./ToggleButton";

type Props = {
  recipientType: "artist" | "publisher";
  bookOfTheDay: BookOfTheDay;
  creatorId?: string;
  bookId: string;
};

const SendBOTDCreatorEmailButton = ({
  recipientType,
  bookOfTheDay,
  creatorId,
  bookId,
}: Props) => {
  const emailSentAt =
    recipientType === "artist"
      ? bookOfTheDay.artistEmailSentAt
      : bookOfTheDay.publisherEmailSentAt;

  const isSent = Boolean(emailSentAt);
  const id = `botd-email-${bookOfTheDay.id}-${recipientType}`;
  const botdDay = normalizeStoredDate(bookOfTheDay.date);
  const botdDateLabel = formatDayLabel(botdDay);

  const alpineAttrs = {
    "x-target": `${id} toast modal-root`,
    "x-target.error": "toast",
    "x-on:ajax:error":
      "($el.querySelector('input[type=checkbox]') as HTMLInputElement).checked = false",
  };

  return (
    <FormPost
      id={id}
      action={`/dashboard/admin/planner/book-of-the-day/send-creator-email`}
      {...alpineAttrs}
    >
      <input type="hidden" name="creatorId" value={creatorId} />
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="recipientType" value={recipientType} />
      <input type="hidden" name="date" value={toDateString(botdDay)} />
      <ToggleButton
        isSent={isSent}
        recipientType={recipientType}
        botdDateLabel={botdDateLabel}
      />
    </FormPost>
  );
};

export default SendBOTDCreatorEmailButton;
