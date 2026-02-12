import { getAllOptions } from "../../../services/creators";
import SectionTitle from "../../app/SectionTitle";
import FeatureGuard from "../../layouts/FeatureGuard";
import ComboBox from "../ui/ComboBox";
import DateInput from "../ui/DateInput";
import FormButtons from "../ui/FormButtons";
import Input from "../ui/Input";
import RadioFields from "../ui/RadioFields";
import TextArea from "../ui/TextArea";
import ToggleInput from "../ui/ToggleInput";

type BookFormProps = {
  formValues?: Record<string, any>;
  isPublisher: boolean;
  bookId?: string;
  action: string;
};

export const BookForm = async ({
  formValues,
  isPublisher,
  bookId,
  action,
}: BookFormProps) => {
  const artistOptions = isPublisher ? await getAllOptions("artist") : [];
  const publisherOptions = !isPublisher ? await getAllOptions("publisher") : [];
  const isEditPage = !!bookId;
  const isArtist = !isPublisher;

  const alpineAttrs = {
    "x-data": `bookForm(
      ${JSON.stringify(formValues)}, 
      ${JSON.stringify(artistOptions)}, 
      ${JSON.stringify(publisherOptions)},
      ${isArtist},
      ${isEditPage})`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()",
  };

  return (
    <div class="space-y-4 ">
      <SectionTitle>Book Details</SectionTitle>
      <form action={action} method="post" {...alpineAttrs}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Title"
            name="form.title"
            maxLength={100}
            validateInput="validateField('title')"
            required
          />
          {isPublisher && !isEditPage && (
            <ComboBox
              label="Artist"
              name="form.artist_id"
              newOptionName="form.new_artist_name"
              type="artist"
              options={artistOptions}
              required
            />
          )}
          <FeatureGuard flagName="artists-can-create-stub-publishers">
            {isArtist && !isEditPage ? (
              <>
                <div x-show="is_self_published">
                  <ToggleInput
                    label="Self Published"
                    name="is_self_published"
                    isChecked={isArtist}
                  />
                </div>
                <div x-show="!is_self_published">
                  <ComboBox
                    label="Publisher"
                    name="form.publisher_id"
                    newOptionName="form.new_publisher_name"
                    type="publisher"
                    options={publisherOptions}
                    required
                  />
                </div>
              </>
            ) : (
              <></>
            )}
          </FeatureGuard>
          <TextArea
            label="Specs"
            name="form.specs"
            validateInput="validateField('specs')"
            maxLength={1000}
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
