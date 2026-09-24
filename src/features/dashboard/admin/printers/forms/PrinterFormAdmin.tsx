import SectionTitle from "../../../../../components/app/SectionTitle";
import FormButtons from "../../../../../components/forms/FormButtons";
import Input from "../../../../../components/forms/Input";
import Select from "../../../../../components/forms/Select";
import TextArea from "../../../../../components/forms/TextArea";
import CountrySelect from "../../../../../components/forms/CountrySelect";

type Props = {
  formValues?: Record<string, any>;
  printerId?: string;
};

export const PrinterFormAdmin = ({ formValues, printerId }: Props) => {
  const isEditPage = !!printerId;

  const alpineAttrs = {
    "x-data": `printerFormAdmin(${JSON.stringify(formValues)}, ${isEditPage})`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()",
  };

  return (
    <div class="space-y-4">
      <SectionTitle>Printer</SectionTitle>
      <form
        action={
          isEditPage
            ? `/dashboard/admin/printers/${printerId}`
            : `/dashboard/admin/printers/create`
        }
        method="post"
        {...alpineAttrs}
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Name"
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
          <Input
            label="Email"
            name="form.email"
            type="email"
            validateInput="validateField('email')"
            required
          />
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
          <div class="md:col-span-2">
            <TextArea
              label="What they print"
              name="form.specialties"
              validateInput="validateField('specialties')"
              maxLength={2000}
            />
          </div>
          <div class="md:col-span-2">
            <TextArea
              label="Note"
              name="form.description"
              validateInput="validateField('description')"
              maxLength={5000}
            />
          </div>
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
            Latitude and longitude place the printer on the map. The email is
            private and only used to send quote requests.
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

export default PrinterFormAdmin;
