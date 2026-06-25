import SectionTitle from "../../../../../components/app/SectionTitle";
import FormButtons from "../../../../../components/forms/FormButtons";
import Input from "../../../../../components/forms/Input";
import Select from "../../../../../components/forms/Select";
import TextArea from "../../../../../components/forms/TextArea";
import CountrySelect from "../../../../../components/forms/CountrySelect";

type StoreFormProps = {
  formValues?: Record<string, any>;
  storeId?: string;
};

export const StoreFormAdmin = ({ formValues, storeId }: StoreFormProps) => {
  const isEditPage = !!storeId;

  const alpineAttrs = {
    "x-data": `storeFormAdmin(${JSON.stringify(formValues)}, ${isEditPage})`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()",
  };

  return (
    <div class="space-y-4">
      <SectionTitle>Store Details</SectionTitle>
      <form
        action={
          isEditPage
            ? `/dashboard/admin/stores/${storeId}`
            : `/dashboard/admin/stores/create`
        }
        method="post"
        {...alpineAttrs}
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Store Name"
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
          <div class="md:col-span-2">
            <TextArea
              label="Address"
              name="form.address"
              validateInput="validateField('address')"
              maxLength={1000}
              required
            />
          </div>
          <Input
            label="City"
            name="form.city"
            maxLength={255}
            validateInput="validateField('city')"
            required
          />
          <CountrySelect isRequired />
          <Input
            label="Website"
            name="form.website"
            type="url"
            validateInput="validateField('website')"
          />
          <Input
            label="Latitude"
            name="form.latitude"
            type="number"
            step="any"
            validateInput="validateField('latitude')"
          />
          <Input
            label="Longitude"
            name="form.longitude"
            type="number"
            step="any"
            validateInput="validateField('longitude')"
          />
          <p class="md:col-span-2 text-sm text-on-surface-weak">
            Latitude and longitude place the store on the map view. Look up
            coordinates in Google Maps if needed.
          </p>
          <Select
            label="Status"
            name="form.status"
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
            ]}
            required
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

export default StoreFormAdmin;
