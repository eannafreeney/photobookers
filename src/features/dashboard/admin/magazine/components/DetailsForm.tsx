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
    editorsLetterTitle: issue.editorsLetterTitle ?? "",
    editorsLetter: issue.editorsLetter.join("\n\n"),
  };

  const alpineAttrs = {
    "x-data": `magazineDetailsForm(${JSON.stringify(initialForm)})`,
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
        <Input
          label="Title"
          name="form.title"
          required
          validateInput="validateField('title')"
        />
        <Input label="Subtitle" name="form.subtitle" />
        <Input label="Editor's letter title" name="form.editorsLetterTitle" />
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
