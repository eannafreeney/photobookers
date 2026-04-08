import Badge from "../../../../../components/app/Badge";
import Button from "../../../../../components/app/Button";
import FormPost from "../../../../../components/forms/FormPost";
import { PublisherOfTheWeek } from "../../../../../db/schema";
import { toWeekString } from "../../../../../lib/utils";
import ToggleButton from "./ToggleButton";

type Props = {
  publisherOfTheWeek: PublisherOfTheWeek;
  creatorId?: string;
};

const SendPOTWCreatorEmailButton = ({
  publisherOfTheWeek,
  creatorId,
}: Props) => {
  const isSent = Boolean(publisherOfTheWeek.emailSentAt);
  const id = `potw-email-${publisherOfTheWeek.id}-publisher`;

  const alpineAttrs = {
    "x-target": `${id} toast modal-root`,
    "x-target.error": "toast",
    "x-on:ajax:error":
      "($el.querySelector('input[type=checkbox]') as HTMLInputElement).checked = false",
  };

  return (
    <FormPost
      id={id}
      action={`/dashboard/admin/planner/publisher-of-the-week/send-creator-email`}
      {...alpineAttrs}
    >
      <input type="hidden" name="creatorId" value={creatorId} />
      <input
        type="hidden"
        name="weekStart"
        value={toWeekString(publisherOfTheWeek.weekStart)}
      />
      <ToggleButton isSent={isSent} recipientType="publisher" />
    </FormPost>
  );
};

export default SendPOTWCreatorEmailButton;
