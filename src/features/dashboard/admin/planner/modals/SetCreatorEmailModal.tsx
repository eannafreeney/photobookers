import Button from "../../../../../components/app/Button";
import Input from "../../../../../components/forms/Input";
import { toWeekString } from "../../../../../lib/utils";

type Props = {
  creatorId: string;
  bookId?: string;
  recipientType?: string;
  weekStart: Date;
  action: string;
  targetId: string;
  featuredId?: string;
};

const SetCreatorEmailModal = ({
  creatorId,
  bookId,
  recipientType,
  weekStart,
  action,
  targetId,
  featuredId,
}: Props) => {
  const alpineAttrs = {
    "x-target": `${targetId} toast modal-root`,
    "x-target.error": "toast",
    "x-target.401": "modal-root",
    "@ajax:after": "$dispatch('dialog:close')",
  };

  return (
    <>
      <p class="text-xs text-on-surface-strong">
        No email found for this creator. Please update the creator&apos;s email.
      </p>
      <form
        method="post"
        action={action}
        class="flex flex-col gap-3"
        {...alpineAttrs}
      >
        <Input label="Email" type="email" name="form.email" />
        <input type="hidden" name="creatorId" value={creatorId} />
        <input type="hidden" name="bookId" value={bookId ?? ""} />
        <input type="hidden" name="recipientType" value={recipientType ?? ""} />
        <input type="hidden" name="weekStart" value={toWeekString(weekStart)} />
        <input type="hidden" name="featuredId" value={featuredId ?? ""} />
        <Button variant="solid" color="primary">
          Submit
        </Button>
      </form>
    </>
  );
};

export default SetCreatorEmailModal;
