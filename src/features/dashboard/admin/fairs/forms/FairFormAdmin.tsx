import SectionTitle from "../../../../../components/app/SectionTitle";
import DateInput from "../../../../../components/forms/DateInput";
import FormButtons from "../../../../../components/forms/FormButtons";
import Input from "../../../../../components/forms/Input";
import Select from "../../../../../components/forms/Select";
import TextArea from "../../../../../components/forms/TextArea";

type FairFormProps = {
  formValues?: Record<string, any>;
  fairId?: string;
};

export const FairFormAdmin = ({ formValues, fairId }: FairFormProps) => {
  const isEditPage = !!fairId;

  const alpineAttrs = {
    "x-data": `fairFormAdmin(${JSON.stringify(formValues)}, ${isEditPage})`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()",
  };

  return (
    <div class="space-y-4">
      <SectionTitle>Fair Details</SectionTitle>
      <form
        action={
          isEditPage
            ? `/dashboard/admin/fairs/${fairId}`
            : `/dashboard/admin/fairs/create`
        }
        method="post"
        {...alpineAttrs}
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Fair Name"
            name="form.name"
            maxLength={200}
            validateInput="validateField('name')"
            required
          />
          <Input
            label="Slug"
            name="form.slug"
            maxLength={255}
            validateInput="validateField('slug')"
            required
          />
          <div class="md:col-span-2">
            <TextArea
              label="Description"
              name="form.description"
              validateInput="validateField('description')"
              maxLength={5000}
            />
          </div>
          <Input
            label="City"
            name="form.city"
            maxLength={255}
            validateInput="validateField('city')"
          />
          <Input
            label="Country"
            name="form.country"
            maxLength={255}
            validateInput="validateField('country')"
          />
          <Input
            label="Venue"
            name="form.venue"
            validateInput="validateField('venue')"
          />
          <Input
            label="Website"
            name="form.website"
            type="url"
            validateInput="validateField('website')"
          />
          <DateInput
            label="Start Date"
            name="form.start_date"
            validateInput="validateField('start_date')"
            required
          />
          <DateInput
            label="End Date"
            name="form.end_date"
            validateInput="validateField('end_date')"
            required
          />
          <Select
            label="Status"
            name="form.status"
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
              { value: "cancelled", label: "Cancelled" },
            ]}
            required
          />
          <Select
            label="Listing Tier"
            name="form.listing_tier"
            options={[
              { value: "free", label: "Free" },
              { value: "promoted", label: "Promoted" },
            ]}
          />
          <Input
            label="Sort Order"
            name="form.sort_order"
            type="number"
            validateInput="validateField('sort_order')"
          />
        </div>
        <FormButtons />
      </form>
    </div>
  );
};
