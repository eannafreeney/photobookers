import SectionTitle from "../../../../../components/app/SectionTitle";
import FormButtons from "../../../../../components/forms/FormButtons";
import Input from "../../../../../components/forms/Input";
import ValidateEmail from "../../../../auth/components/ValidateEmail";
import { getAllCreatorProfiles } from "../../creators/services";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox";

const CreateUserFormAdmin = async () => {
  const creators = await getAllCreatorProfiles();

  const alpineAttrs = {
    "x-data": "newUserForm()",
    "x-target": "modal-root create-user-form",
    "x-target.error": "toast",
    "x-on:ajax:success": "isSubmitting = false, $dispatch('users:updated')",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:email-availability.window":
      "emailIsTaken = !$event.detail.emailIsAvailable",
  };

  const options = creators.map((creator) => ({
    id: creator.id,
    label: creator.displayName,
    img: creator.coverUrl,
  }));

  return (
    <div id="create-user-form" class="flex flex-col gap-4">
      <SectionTitle>New User</SectionTitle>
      <form
        action="/dashboard/admin/users/create"
        method="post"
        class="flex flex-col md:flex-row items-center justify-between gap-4"
        {...alpineAttrs}
      >
        <div class="flex-1 min-w-0 w-full md:w-auto">
          <ValidateEmail />
        </div>
        <div class="flex-1 min-w-0 w-full md:w-auto">
          <Input
            label="First Name"
            name="form.firstName"
            validateInput="validateField('firstName')"
          />
        </div>
        <div class="flex-1 min-w-0 w-full md:w-auto">
          <Input
            label="Last Name"
            name="form.lastName"
            validateInput="validateField('lastName')"
          />
        </div>
        <div class="flex-1 min-w-0 w-full md:w-auto">
          <OptionsComboBox options={options} name="form.creatorId" />
        </div>
        <FormButtons buttonText="Create" loadingText="Creating..." />
      </form>
    </div>
  );
};

export default CreateUserFormAdmin;
