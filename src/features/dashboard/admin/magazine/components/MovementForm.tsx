import FormPost from "@/components/forms/FormPost";
import Input from "@/components/forms/Input";
import Button from "@/components/app/Button";
import { loadingIcon } from "@/lib/icons";
import { MagazineMovementData } from "@/db/schema";

type Props = {
  movement: MagazineMovementData;
  action: string;
};

const MovementForm = ({ movement, action }: Props) => {
  const initialForm = {
    kicker: movement.kicker,
    lead: movement.lead,
    title: movement.title,
  };

  return (
    <FormPost
      action={`${action}/movement`}
      x-data={`magazineMovementForm(${JSON.stringify(initialForm)})`}
      x-target="toast"
      x-on:submit="submitForm($event)"
      className="flex flex-wrap items-end gap-2 border-b border-outline pb-3"
    >
      <input type="hidden" name="movementId" value={movement.id} />
      <div class="w-32">
        <Input
          label="Kicker"
          name="form.kicker"
          required
          validateInput="validateField('kicker')"
        />
      </div>
      <div class="w-44">
        <Input
          label="Lead"
          name="form.lead"
          required
          validateInput="validateField('lead')"
        />
      </div>
      <div class="min-w-48 flex-1">
        <Input
          label="Title"
          name="form.title"
          required
          validateInput="validateField('title')"
        />
      </div>
      <div class="-mb-1">
        <Button
          variant="solid"
          color="primary"
          width="auto"
          x-bind:disabled="isSubmitting || !isFormValid"
        >
          <span x-show="!isSubmitting">Save movement</span>
          <span x-show="isSubmitting" class="flex items-center gap-2">
            Saving... {loadingIcon}
          </span>
        </Button>
      </div>
    </FormPost>
  );
};

export default MovementForm;
