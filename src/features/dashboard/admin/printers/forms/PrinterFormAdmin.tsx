import SectionTitle from "../../../../../components/app/SectionTitle";
import FormButtons from "../../../../../components/forms/FormButtons";
import Input from "../../../../../components/forms/Input";
import TextArea from "../../../../../components/forms/TextArea";
import CountrySelect from "../../../../../components/forms/CountrySelect";
import type { PrinterStatus } from "../../../../../db/types";
import PrinterPublishToggle from "../components/PrinterPublishToggle";

type Props = {
  formValues?: Record<string, any>;
  printerId?: string;
  status?: PrinterStatus;
  viewHref?: string;
};

export const PrinterFormAdmin = ({
  formValues,
  printerId,
  status,
  viewHref,
}: Props) => {
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
      <div class="flex items-center justify-between gap-4">
        <SectionTitle>Printer</SectionTitle>
        {printerId ? (
          <PrinterPublishToggle
            printerId={printerId}
            status={status ?? "draft"}
          />
        ) : null}
      </div>
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
        </div>
        <FormButtons viewHref={viewHref} />
      </form>
    </div>
  );
};

export default PrinterFormAdmin;
