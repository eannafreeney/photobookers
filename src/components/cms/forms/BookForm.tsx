import { getAllOptions } from "../../../services/creators";
import Form from "../../app/Form";
import SectionTitle from "../../app/SectionTitle";
import ComboBox from "../ui/ComboBox";
import FormButton from "../ui/FormButton";
import Input from "../ui/Input";
import RadioFields from "../ui/RadioFields";
import TextArea from "../ui/TextArea";
import ToggleInput from "../ui/ToggleInput";

type BookFormProps = {
  formValues?: Record<string, any>;
  dateIsInPast?: boolean;
  isPublisher: boolean;
  bookId?: string;
  action: string;
};

export const BookForm = async ({
  formValues,
  dateIsInPast,
  isPublisher,
  bookId,
  action,
}: BookFormProps) => {
  const artistOptions = isPublisher ? await getAllOptions("artist") : [];
  const publisherOptions = !isPublisher ? await getAllOptions("publisher") : [];
  const isEditPage = !!bookId;
  const isArtist = !isPublisher;

  return (
    <div class="space-y-4 ">
      <SectionTitle>Book Details</SectionTitle>
      <Form
        x-data={`bookForm(
          ${JSON.stringify(formValues)}, 
          ${JSON.stringify(artistOptions)}, 
          ${JSON.stringify(publisherOptions)},
          ${isArtist},
          ${isEditPage})`}
        action={action}
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Title"
            name="form.title"
            maxLength={100}
            validateInput="validateField('title')"
            required
          />
          {isPublisher && (
            <ComboBox
              label="Artist"
              name="form.artist_id"
              newOptionName="form.new_artist_name"
              options={artistOptions}
              required
            />
          )}
          {isArtist ? (
            <>
              <ToggleInput
                label="Is Self Published"
                name="is_self_published"
                isChecked={isArtist}
              />
              <div x-show="!is_self_published">
                <ComboBox
                  label="Publisher"
                  name="form.publisher_id"
                  newOptionName="form.new_publisher_name"
                  options={publisherOptions}
                  required
                />
              </div>
            </>
          ) : null}

          <Input
            label="Release Date"
            name="form.release_date"
            type="date"
            isDisabled={dateIsInPast ?? false}
            validateInput="validateField('release_date')"
            required
          />
          <TextArea
            label="Introduction"
            name="form.intro"
            validateInput="validateField('intro')"
            maxLength={200}
            minRows={4}
            required
          />
          <TextArea
            label="Specs"
            name="form.specs"
            validateInput="validateField('specs')"
            maxLength={300}
            required
          />
          <TextArea
            label="Description"
            name="form.description"
            validateInput="validateField('description')"
            maxLength={2000}
            required
          />
          <RadioFields
            label="Status"
            name="form.availability_status"
            validateInput="validateField('availability_status')"
            options={[
              { value: "available", label: "Available" },
              { value: "sold_out", label: "Sold Out" },
              { value: "unavailable", label: "Unavailable" },
              { value: "upcoming", label: "Upcoming" },
            ]}
          />
          <Input
            label="Tags"
            name="form.tags"
            placeholder="photography, landscape, Japan (comma-separated)"
          />
          <FormButton
            buttonText={isEditPage ? "Update" : "Create"}
            loadingText={isEditPage ? "Updating..." : "Creating..."}
          />
        </div>
      </Form>
    </div>
  );
};
