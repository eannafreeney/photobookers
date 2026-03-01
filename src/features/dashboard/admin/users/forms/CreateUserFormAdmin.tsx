import SectionTitle from "../../../../../components/app/SectionTitle";
import FormButtons from "../../../../../components/cms/ui/FormButtons";
import Input from "../../../../../components/cms/ui/Input";

const CreateUserFormAdmin = () => {
  const alpineAttrs = {
    "x-data": "newUserForm()",
    "x-target": "toast users-table-container new-user-form",
  };

  return (
    <div id="new-user-form" class="flex flex-col gap-4">
      <SectionTitle>New User</SectionTitle>
      <form
        action="/dashboard/admin/users/new"
        method="post"
        {...alpineAttrs}
        class="flex items-center justify-between gap-4"
      >
        <div class="flex-1 min-w-0">
          <Input
            label="Email"
            name="form.email"
            type="email"
            required
            validateInput="validateEmail()"
            showEmailAvailabilityChecker
          />
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
        <div class="flex-1 min-w-0">
          <Input
            label="Password"
            name="form.password"
            type="password"
            required
            validateInput="validateField('password')"
          />
        </div>
        <FormButtons buttonText="Create" loadingText="Creating..." />
      </form>
    </div>
  );
};

export default CreateUserFormAdmin;
