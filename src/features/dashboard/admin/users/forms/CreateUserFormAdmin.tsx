import SectionTitle from "../../../../../components/app/SectionTitle";
import FormButtons from "../../../../../components/forms/FormButtons";
import Input from "../../../../../components/forms/Input";
import ValidateEmail from "../../../../auth/components/ValidateEmail";
import { getAllCreatorProfiles } from "../../creators/services";
import CreatorsComboBox from "../components/CreatorsComboBox";

const CreateUserFormAdmin = async () => {
  const creators = await getAllCreatorProfiles();

  const alpineAttrs = {
    "x-data": "newUserForm()",
    "x-target": "modal-root create-user-form",
    "x-target.error": "toast",
    "x-on:ajax:success": "isSubmitting = false, $dispatch('users:updated')",
    "x-on:ajax:error": "isSubmitting = false",
  };

  return (
    <div id="create-user-form" class="flex flex-col gap-4">
      <SectionTitle>New User</SectionTitle>
      <form
        action="/dashboard/admin/users/create"
        method="post"
        class="flex items-center justify-between gap-4"
        {...alpineAttrs}
      >
        <div class="flex-1 min-w-0">
          <ValidateEmail />
        </div>
        <div class="flex-1 min-w-0">
          <Input
            label="First Name"
            name="form.firstName"
            required
            validateInput="validateField('firstName')"
          />
        </div>
        <div class="flex-1 min-w-0">
          <Input
            label="Last Name"
            name="form.lastName"
            required
            validateInput="validateField('lastName')"
          />
        </div>
        <div class="flex-1 min-w-0 grid gap-1.5 text-xs">
          <label class="pl-0.5">Assign Creator</label>
          <CreatorsComboBox creators={creators} />
        </div>
        <div class="grid gap-1.5 text-xs">
          <span class="pl-0.5 opacity-0">‎</span>{" "}
          {/* invisible spacer matching label height */}
          <FormButtons buttonText="Create" loadingText="Creating..." />
        </div>{" "}
      </form>
    </div>
  );
};

export default CreateUserFormAdmin;
