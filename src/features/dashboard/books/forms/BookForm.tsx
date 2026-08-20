import SectionTitle from "../../../../components/app/SectionTitle";
import ComboBox from "../../../../components/forms/ComboBox";
import DateInput from "../../../../components/forms/DateInput";
import FormButtons from "../../../../components/forms/FormButtons";
import Input from "../../../../components/forms/Input";
import RadioFields from "../../../../components/forms/RadioFields";
import TextArea from "../../../../components/forms/TextArea";
import ToggleInput from "../../../../components/forms/ToggleInput";
import { getAllCreatorOptions } from "../../admin/creators/services";
import FormPost from "../../../../components/forms/FormPost";
import BookPressLinksSection from "../components/BookPressLinksSection";

type BookFormProps = {
  formValues?: Record<string, any>;
  isPublisher: boolean;
  /** Contributor mode: user picks artist + optional publisher (or self-publish) */
  isContributor?: boolean;
  bookId?: string;
  action: string;
  /** Primary submit label for review workflow vs normal save */
  primaryAction?: "save" | "submit_for_review";
};

export const BookForm = async ({
  formValues,
  isPublisher,
  isContributor = false,
  bookId,
  action,
  primaryAction = "save",
}: BookFormProps) => {
  const artistOptions =
    isPublisher || isContributor ? await getAllCreatorOptions("artist") : [];
  const publisherOptions =
    !isPublisher || isContributor
      ? await getAllCreatorOptions("publisher")
      : [];

  const isEditPage = !!bookId;
  const isArtist = !isPublisher && !isContributor;

  const mergedFormValues = {
    ...(formValues ?? {}),
    intent: isContributor ? "contributor" : isPublisher ? "publisher" : "artist",
  };

  const alpineAttrs = {
    "x-data": `bookForm(
      ${JSON.stringify(mergedFormValues)}, 
      ${JSON.stringify(artistOptions)}, 
      ${JSON.stringify(publisherOptions)},
      ${isArtist},
      ${isEditPage},
      ${isContributor})`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()",
  };

  return (
    <div class="space-y-4 ">
      <SectionTitle>Book Details</SectionTitle>
      <FormPost action={action} {...alpineAttrs}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Title"
            name="form.title"
            maxLength={100}
            validateInput="validateField('title')"
            required
          />
          {isContributor && !isEditPage && (
            <>
              <ComboBox
                label="Artist"
                name="form.artist_id"
                newOptionName="form.new_artist_name"
                type="artist"
                options={artistOptions}
                required
              />
              <ToggleInput
                label="Self Published"
                name="is_self_published"
                isChecked={false}
              />
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
          )}
          {!isContributor && isPublisher && !isEditPage && (
            <ComboBox
              label="Artist"
              name="form.artist_id"
              newOptionName="form.new_artist_name"
              type="artist"
              options={artistOptions}
              required
            />
          )}
          {!isContributor && isArtist && !isEditPage ? (
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
          <TextArea
            label="Description"
            name="form.description"
            validateInput="validateField('description')"
            maxLength={5000}
            minRows={5}
            required
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
            required
          />
          <Input
            label="Tags"
            name="form.tags"
            placeholder="photography, landscape, Japan (comma-separated)"
            validateInput="validateField('tags')"
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
            ]}
          />
          {!isEditPage && !isContributor && (
            <ToggleInput
              label="Send email to followers on release date"
              name="form.send_email_to_followers_on_release"
              isChecked={false}
              disabledBinding="!form.release_date || new Date(form.release_date + 'T23:59:59') < new Date()"
            />
          )}
          <BookPressLinksSection />
          <input type="hidden" name="intent" x-model="form.intent" />
          <FormButtons
            buttonText={
              primaryAction === "submit_for_review"
                ? "Submit for review"
                : "Save"
            }
            loadingText={
              primaryAction === "submit_for_review"
                ? "Submitting…"
                : "Saving…"
            }
          />
        </div>
      </FormPost>
    </div>
  );
};
