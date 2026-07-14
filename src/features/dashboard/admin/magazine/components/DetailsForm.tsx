import Button from "@/components/app/Button";
import { MagazineIssueView } from "@/domain/magazine/queries";

type Props = {
  issue: MagazineIssueView;
  action: string;
};

const DetailsForm = ({ issue, action }: Props) => {
  return (
    <form
      method="post"
      action={`${action}/details`}
      class="flex flex-col gap-3 border-t border-outline pt-4"
    >
      <span class="kicker text-accent">Edit details</span>
      <label class="flex flex-col gap-1">
        <span class="text-xs font-semibold text-on-surface">Title</span>
        <input
          name="title"
          value={issue.title}
          class="w-full border border-outline bg-surface px-3 py-2 text-sm text-on-surface"
        />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-xs font-semibold text-on-surface">Subtitle</span>
        <input
          name="subtitle"
          value={issue.subtitle ?? ""}
          class="w-full border border-outline bg-surface px-3 py-2 text-sm text-on-surface"
        />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-xs font-semibold text-on-surface">
          Editor's letter title
        </span>
        <input
          name="editorsLetterTitle"
          value={issue.editorsLetterTitle ?? ""}
          class="w-full border border-outline bg-surface px-3 py-2 text-sm text-on-surface"
        />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-xs font-semibold text-on-surface">
          Editor's letter
        </span>
        <textarea
          name="editorsLetter"
          rows={10}
          class="w-full border border-outline bg-surface px-3 py-2 text-sm leading-relaxed text-on-surface"
        >
          {issue.editorsLetter.join("\n\n")}
        </textarea>
        <span class="text-xs text-on-surface-weak">
          Separate paragraphs with a blank line.
        </span>
      </label>
      <div>
        <Button variant="outline" color="primary">
          Save details
        </Button>
      </div>
    </form>
  );
};

export default DetailsForm;
