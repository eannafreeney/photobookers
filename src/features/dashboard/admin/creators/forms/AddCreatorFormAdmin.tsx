import FormButtons from "../../../../../components/forms/FormButtons";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Select from "../../../../../components/forms/Select";
import ValidateDisplayName from "../../../../auth/components/ValidateDisplayName";
import ValidateWebsite from "../../../../auth/components/ValidateWebsite";

const AddCreatorFormAdmin = () => {
  const alpineAttrs = {
    "x-data": `addCreatorFormAdmin()`,
    "x-target": "toast creators-table",
    "x-target.error": "toast",
    "x-target.away": "_top",
    "x-on:ajax:success": "onSuccess()",
    "x-on:ajax:error": "onError()",
    "x-on:submit": "submitForm($event)",
    "x-on:displayName-availability.window":
      "displayNameIsTaken = !$event.detail.displayNameIsAvailable",
    "x-on:website-availability.window":
      "websiteIsTaken = !$event.detail.websiteIsAvailable",
  };

  return (
    <div class="space-y-4 ">
      <SectionTitle>Create Creator</SectionTitle>
      <form
        action="/dashboard/admin/creators/create"
        method="post"
        {...alpineAttrs}
      >
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2">
          <ValidateDisplayName />
          <ValidateWebsite />
          <Select
            label="Type"
            name="form.type"
            options={[
              { label: "Artist", value: "artist" },
              { label: "Publisher", value: "publisher" },
            ]}
            required
          />
        </div>
        <FormButtons />
      </form>
    </div>
  );
};

export default AddCreatorFormAdmin;
