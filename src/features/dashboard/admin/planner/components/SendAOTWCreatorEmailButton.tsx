import Badge from "../../../../../components/app/Badge";
import Button from "../../../../../components/app/Button";
import FormPost from "../../../../../components/forms/FormPost";
import { ArtistOfTheWeek } from "../../../../../db/schema";
import { toWeekString } from "../../../../../lib/utils";
import ToggleButton from "./ToggleButton";

type Props = {
  artistOfTheWeek: ArtistOfTheWeek;
  creatorId?: string;
};

const SendAOTWCreatorEmailButton = ({ artistOfTheWeek, creatorId }: Props) => {
  const isSent = Boolean(artistOfTheWeek.emailSentAt);
  const id = `aotw-email-${artistOfTheWeek.id}-artist`;

  const alpineAttrs = {
    "x-target": `${id} toast modal-root`,
    "x-target.error": "toast",
    "x-on:ajax:error":
      "($el.querySelector('input[type=checkbox]') as HTMLInputElement).checked = false",
  };

  return (
    <FormPost
      id={id}
      action={`/dashboard/admin/planner/artist-of-the-week/send-creator-email`}
      {...alpineAttrs}
    >
      <input type="hidden" name="creatorId" value={creatorId} />
      <input
        type="hidden"
        name="weekStart"
        value={toWeekString(artistOfTheWeek.weekStart)}
      />
      <ToggleButton isSent={isSent} recipientType="artist" />
    </FormPost>
  );
};

export default SendAOTWCreatorEmailButton;
