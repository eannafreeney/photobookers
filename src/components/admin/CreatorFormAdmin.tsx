import FormButtons from "../cms/ui/FormButtons";
import Input from "../cms/ui/Input";
import SectionTitle from "../app/SectionTitle";
import Select from "../cms/ui/Select";

const CreatorFormAdmin = () => {
  const alpineAttrs = {
    "x-data": `creatorFormAdmin()`,
    "x-target": "toast creators-table",
    "x-target.error": "toast",
    "x-target.away": "_top",
    "x-on:ajax:success": "onSuccess()",
    "x-on:ajax:error": "onError()",
    "x-on:submit": "submitForm($event)",
  };

  return (
    <div class="space-y-4 ">
      <SectionTitle>Create Creator</SectionTitle>
      <form
        action="/dashboard/admin/creators/new"
        method="post"
        {...alpineAttrs}
      >
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2">
          <Input
            label="Display Name"
            name="form.displayName"
            validateInput="validateDisplayName()"
            showDisplayNameAvailabilityChecker
            required
          />
          <Input
            label="Website"
            name="form.website"
            type="url"
            placeholder="https://..."
            required
            showWebsiteAvailabilityStatus
            validateInput="validateWebsite()"
          />
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

export default CreatorFormAdmin;
