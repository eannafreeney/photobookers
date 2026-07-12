import FormButtons from "../../../../../components/forms/FormButtons";
import Input from "../../../../../components/forms/Input";
import SectionTitle from "../../../../../components/app/SectionTitle";
import FormPost from "../../../../../components/forms/FormPost";

type Props = {
  formValues: {
    email: string;
    firstName: string;
    lastName: string;
  };
  userId: string;
};

const EditUserFormAdmin = ({ formValues, userId }: Props) => {
  const alpineAttrs = {
    "x-data": `editUserFormAdmin(${JSON.stringify(formValues)}, true)`,
    "x-target": "toast",
    "x-target.error": "toast",
    "x-on:ajax:success": "onSuccess()",
    "x-on:ajax:error": "onError()",
    "x-on:submit": "submitForm($event)",
  };

  return (
    <div class="space-y-4">
      <SectionTitle>Edit user</SectionTitle>
      <FormPost action={`/dashboard/admin/users/${userId}`} {...alpineAttrs}>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          <Input
            label="Email"
            name="form.email"
            type="email"
            validateInput="validateField('email')"
            required
          />
          <Input
            label="First Name"
            name="form.firstName"
            validateInput="validateField('firstName')"
          />
          <Input
            label="Last Name"
            name="form.lastName"
            validateInput="validateField('lastName')"
          />
        </div>
        <FormButtons buttonText="Save" loadingText="Saving..." />
      </FormPost>
    </div>
  );
};

export default EditUserFormAdmin;
