import Button from "../../../components/app/Button";
import FormPost from "../../../components/forms/FormPost";
import { AuthUser } from "../../../../types";

type Props = {
  user: AuthUser;
};

const inputClass =
  "bg-surface rounded-radius border border-outline hover:border-outline-strong transition-colors px-3 py-2 text-base md:text-sm font-normal text-on-surface focus:outline focus:outline-offset-2 focus:outline-accent";

const UserProfileForm = ({ user }: Props) => {
  const alpineAttrs = {
    "x-target": "toast",
    "x-target.error": "toast",
  };

  return (
    <FormPost
      action={`/users/${user.id}/edit`}
      className="space-y-4"
      {...alpineAttrs}
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium text-on-surface-strong">First name</span>
          <input
            type="text"
            name="firstName"
            value={user.firstName ?? ""}
            maxLength={255}
            autocomplete="given-name"
            placeholder="First name"
            class={inputClass}
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium text-on-surface-strong">Last name</span>
          <input
            type="text"
            name="lastName"
            value={user.lastName ?? ""}
            maxLength={255}
            autocomplete="family-name"
            placeholder="Last name"
            class={inputClass}
          />
        </label>
      </div>
      <Button variant="solid" color="primary" width="lg">
        <span>Save</span>
      </Button>
    </FormPost>
  );
};

export default UserProfileForm;
