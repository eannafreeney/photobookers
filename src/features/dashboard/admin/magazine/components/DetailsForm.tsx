import FormPost from "@/components/forms/FormPost";
import Input from "@/components/forms/Input";
import TextArea from "@/components/forms/TextArea";
import FormButtons from "@/components/forms/FormButtons";
import { MagazineIssueView } from "@/domain/magazine/queries";

type Props = {
  issue: MagazineIssueView;
  action: string;
};

const DetailsForm = ({ issue, action }: Props) => {
  const initialForm = {
    title: issue.title,
    subtitle: issue.subtitle ?? "",
    editorsLetter: issue.editorsLetter.join("\n\n"),
  };

  const alpineAttrs = {
    "x-data": `magazineDetailsForm(${JSON.stringify(initialForm)}, ${JSON.stringify(
      `${action}/regenerate-title`,
    )})`,
    "x-target": "toast",
    "x-on:submit": "submitForm($event)",
  };

  return (
    <div class="flex flex-col gap-3 border-t border-outline pt-4">
      <span class="kicker text-accent">Edit details</span>
      <FormPost
        {...alpineAttrs}
        action={`${action}/details`}
        className="flex flex-col gap-3"
      >
        <div class="flex items-end gap-2">
          <div class="flex-1">
            <Input
              label="Title"
              name="form.title"
              required
              validateInput="validateField('title')"
            />
          </div>
          <button
            type="button"
            x-on:click="regenerateTitle()"
            x-bind:disabled="regeneratingTitle"
            class="mb-1 shrink-0 border border-outline px-3 py-2 text-sm font-semibold text-on-surface hover:border-outline-strong disabled:opacity-60"
          >
            <span x-show="!regeneratingTitle">Regenerate</span>
            <span x-show="regeneratingTitle" x-cloak>Regenerating…</span>
          </button>
        </div>
        <p x-show="titleError" x-cloak x-text="titleError" class="text-sm text-danger"></p>
        <Input label="Subtitle" name="form.subtitle" />
        <TextArea
          label="Editor's letter"
          name="form.editorsLetter"
          minRows={10}
          placeholder="Separate paragraphs with a blank line."
        />
        <FormButtons buttonText="Save details" loadingText="Saving..." />
      </FormPost>
    </div>
  );
};

export default DetailsForm;
