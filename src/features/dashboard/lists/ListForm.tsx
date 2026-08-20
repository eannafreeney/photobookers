import FormButtons from "../../../components/forms/FormButtons";
import FormPost from "../../../components/forms/FormPost";
import Input from "../../../components/forms/Input";
import TextArea from "../../../components/forms/TextArea";
import ToggleInput from "../../../components/forms/ToggleInput";

type Props = {
  formValues?: Record<string, unknown>;
  listId?: string;
  disabled?: boolean;
};

const ListForm = ({ formValues, listId, disabled = false }: Props) => {
  const isEditPage = !!listId;
  const action = isEditPage ? `/dashboard/lists/${listId}` : "/dashboard/lists";

  const alpineAttrs = disabled
    ? {
        "x-data": `listForm(${JSON.stringify(formValues ?? {})}, ${isEditPage})`,
        "x-on:submit.prevent": "",
      }
    : {
        "x-data": `listForm(${JSON.stringify(formValues ?? {})}, ${isEditPage})`,
        "x-on:submit": "submitForm($event)",
        "x-target": isEditPage
          ? "toast list-form-panel list-share-panel"
          : "toast",
        "x-target.error": "toast",
        "x-on:ajax:error": "isSubmitting = false",
        "x-on:ajax:success": "onSuccess()",
      };

  return (
    <FormPost
      id={isEditPage ? "list-form-panel" : "list-create-form"}
      action={action}
      class="flex flex-col gap-4 max-w-xl"
      {...alpineAttrs}
    >
      {isEditPage ? <input type="hidden" name="_method" value="PATCH" /> : null}

      <fieldset
        disabled={disabled}
        class={`flex flex-col gap-4 ${disabled ? "opacity-50" : ""}`}
      >
        <Input
          label="Title"
          name="form.title"
          maxLength={255}
          validateInput="validateField('title')"
          placeholder="Favourite books of the year"
          required
        />

        <TextArea
          label="Description"
          name="form.description"
          maxLength={2000}
          minRows={4}
          validateInput="validateField('description')"
          placeholder="Optional notes about this list"
        />

        {isEditPage ? (
          <>
            <Input
              label="URL slug"
              name="form.slug"
              maxLength={255}
              validateInput="validateField('slug')"
              required
            />
            <p class="-mt-2 text-xs text-on-surface-weak">
              Used in your public list URL when the list is public.
            </p>
            <ToggleInput
              label="Make this list public on my shelf"
              name="form.isPublic"
              isChecked={Boolean(formValues?.isPublic)}
            />
          </>
        ) : null}

        <FormButtons
          buttonText={isEditPage ? "Save changes" : "Create list"}
          loadingText={isEditPage ? "Saving…" : "Creating…"}
          isDisabled={disabled}
        />
      </fieldset>
    </FormPost>
  );
};

export default ListForm;
