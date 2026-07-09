import Modal from "../../../../../components/app/Modal";
import FormPost from "../../../../../components/forms/FormPost";

type Props = {
  week: string;
  fieldKey: string;
  title: string;
  subtitle: string;
  currentBlurb: string;
  sourceText: string | null;
};

const SpotlightBlurbModal = ({
  week,
  fieldKey,
  title,
  subtitle,
  currentBlurb,
  sourceText,
}: Props) => {
  const encodedWeek = encodeURIComponent(week);
  const encodedKey = encodeURIComponent(fieldKey);
  const saveAction = `/dashboard/admin/planner/spotlight-blurb/prepare?week=${encodedWeek}&key=${encodedKey}`;
  const generateAction = `/dashboard/admin/planner/spotlight-blurb/generate?week=${encodedWeek}&key=${encodedKey}`;
  const formAttrs = {
    "x-target": "toast",
    "x-target.error": "toast",
    "x-on:ajax:success": "$dispatch('dialog:close'), $dispatch('planner:updated')",
  };

  return (
    <Modal title={title} maxWidth="max-w-2xl">
      <p class="mb-2 text-sm font-medium text-on-surface-strong">{subtitle}</p>
      <p class="mb-4 text-sm text-on-surface">
        Edit this spotlight blurb manually, or generate a rewritten version from
        the source text.
      </p>
      <FormPost
        action={saveAction}
        className="space-y-4"
        {...formAttrs}
        x-data={`spotlightBlurbModal('${generateAction}')`}
        {...{
          "x-on:ajax:after": "isGenerating = false",
          "x-on:ajax:error": "isGenerating = false",
        }}
      >
        <input type="hidden" name="week" value={week} />
        <input type="hidden" name="key" value={fieldKey} />
        {sourceText ? (
          <details class="text-xs text-on-surface">
            <summary class="cursor-pointer font-medium text-on-surface-strong">
              Source text
            </summary>
            <p class="mt-2 whitespace-pre-wrap rounded border border-outline/60 bg-surface-alt p-3">
              {sourceText}
            </p>
          </details>
        ) : null}
        <label
          for="spotlight-blurb-textarea"
          class="block text-xs font-medium text-on-surface"
        >
          Spotlight blurb
        </label>
        <textarea
          id="spotlight-blurb-textarea"
          name="blurb"
          rows={8}
          x-merge="replace"
          class="w-full rounded border border-outline bg-surface px-3 py-2 text-sm text-on-surface"
        >
          {currentBlurb}
        </textarea>
        <div class="flex flex-wrap items-center gap-2 border-t border-outline pt-4">
          <button
            type="button"
            {...{
              "x-on:click.prevent": "generate()",
              "x-bind:class": "isGenerating ? 'pointer-events-none opacity-60' : ''",
              "x-bind:aria-busy": "isGenerating",
            }}
            class="rounded border border-outline bg-surface px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-alt cursor-pointer"
          >
            <span x-show="!isGenerating">Generate blurb</span>
            <span x-show="isGenerating">Generating...</span>
          </button>
          <button
            type="submit"
            class="rounded border border-primary bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 cursor-pointer"
          >
            Save
          </button>
        </div>
      </FormPost>
    </Modal>
  );
};

export default SpotlightBlurbModal;
