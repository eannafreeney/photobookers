import FormButtons from "../../../components/forms/FormButtons";
import { BookList } from "../../../db/schema";

type Props = {
  list?: BookList | null;
};

const ListForm = ({ list }: Props) => {
  const isEdit = Boolean(list);
  const action = isEdit ? `/dashboard/lists/${list!.id}` : "/dashboard/lists";

  // Create uses a normal full-page POST (redirect to the new list).
  // Edit uses alpine-ajax to swap the form panel.
  const alpineAttrs = isEdit
    ? {
        "x-data": "{ isSubmitting: false }",
        "@ajax:before": "isSubmitting = true",
        "@ajax:after": "isSubmitting = false",
        "@ajax:error": "isSubmitting = false",
        "x-target": "toast list-form-panel",
        "x-target.error": "toast",
      }
    : {
        "x-data": "{ isSubmitting: false }",
        "@submit": "isSubmitting = true",
      };

  return (
    <form
      id={isEdit ? "list-form-panel" : "list-create-form"}
      method="post"
      action={action}
      class="flex flex-col gap-4 max-w-xl"
      {...alpineAttrs}
    >
      {isEdit ? <input type="hidden" name="_method" value="PATCH" /> : null}

      <div class="flex flex-col gap-1">
        <label class="kicker text-on-surface-weak" for="list-title">
          Title
        </label>
        <input
          id="list-title"
          name="title"
          required
          maxlength={255}
          value={list?.title ?? ""}
          placeholder="Favourite books of the year"
          class="rounded-radius border border-outline bg-surface px-3 py-2 text-sm text-on-surface-strong"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="kicker text-on-surface-weak" for="list-description">
          Description
        </label>
        <textarea
          id="list-description"
          name="description"
          maxlength={2000}
          rows={4}
          placeholder="Optional notes about this list"
          class="rounded-radius border border-outline bg-surface px-3 py-2 text-sm text-on-surface-strong"
        >
          {list?.description ?? ""}
        </textarea>
      </div>

      {isEdit ? (
        <div class="flex flex-col gap-1">
          <label class="kicker text-on-surface-weak" for="list-slug">
            URL slug
          </label>
          <input
            id="list-slug"
            name="slug"
            required
            maxlength={255}
            value={list?.slug ?? ""}
            class="rounded-radius border border-outline bg-surface px-3 py-2 text-sm text-on-surface-strong"
          />
          <p class="text-xs text-on-surface-weak">
            Used in your public list URL when the list is public.
          </p>
        </div>
      ) : null}

      <label class="flex items-center gap-2 text-sm text-on-surface">
        <input
          type="checkbox"
          name="isPublic"
          value="true"
          checked={list?.isPublic ?? false}
          class="size-4"
        />
        Make this list public on my shelf
      </label>

      <FormButtons
        buttonText={isEdit ? "Save changes" : "Create list"}
        loadingText={isEdit ? "Saving…" : "Creating…"}
      />
    </form>
  );
};

export default ListForm;
