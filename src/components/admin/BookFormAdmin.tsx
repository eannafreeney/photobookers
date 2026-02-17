import { getAllOptions } from "../../services/creators";
import SectionTitle from "../app/SectionTitle";
import ComboBox from "../cms/ui/ComboBox";
import DateInput from "../cms/ui/DateInput";
import FormButtons from "../cms/ui/FormButtons";
import Input from "../cms/ui/Input";
import RadioFields from "../cms/ui/RadioFields";
import TextArea from "../cms/ui/TextArea";

type BookFormProps = {
  formValues?: Record<string, any>;
  bookId?: string;
};

export const BookFormAdmin = async ({ formValues, bookId }: BookFormProps) => {
  const artistOptions = await getAllOptions("artist");
  const publisherOptions = await getAllOptions("publisher");
  const isEditPage = !!bookId;

  const alpineAttrs = {
    "x-data": `bookFormAdmin(
      ${JSON.stringify(formValues)}, 
      ${JSON.stringify(artistOptions)}, 
      ${JSON.stringify(publisherOptions)},
      ${isEditPage},
    )`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()",
  };

  return (
    <div class="space-y-4 ">
      <SectionTitle>Book Details</SectionTitle>
      <form
        action={
          isEditPage
            ? `/dashboard/admin/books/edit/${bookId}`
            : `/dashboard/admin/books/new`
        }
        method="post"
        {...alpineAttrs}
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Title"
            name="form.title"
            maxLength={100}
            validateInput="validateField('title')"
            required
          />
          <ComboBox
            label="Artist"
            name="form.artist_id"
            newOptionName="form.new_artist_name"
            type="artist"
            options={artistOptions}
            required
          />
          <ComboBox
            label="Publisher"
            name="form.publisher_id"
            newOptionName="form.new_publisher_name"
            type="publisher"
            options={publisherOptions}
          />
          <TextArea
            label="Description"
            name="form.description"
            validateInput="validateField('description')"
            maxLength={5000}
          />
          <Input
            label="Purchase Link"
            name="form.purchase_link"
            type="url"
            validateInput="validateField('purchase_link')"
          />
          <DateInput
            label="Release Date"
            name="form.release_date"
            validateInput="validateField('release_date')"
          />
          <Input
            label="Tags"
            name="form.tags"
            placeholder="photography, landscape, Japan (comma-separated)"
          />
          <RadioFields
            label="Status"
            name="form.availability_status"
            validateInput="validateField('availability_status')"
            options={[
              { value: "available", label: "Available" },
              { value: "sold_out", label: "Sold Out" },
              { value: "unavailable", label: "Unavailable" },
            ]}
          />
          <FormButtons />
        </div>
      </form>
    </div>
  );
};
