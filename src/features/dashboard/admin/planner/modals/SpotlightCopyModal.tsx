import Modal from "../../../../../components/app/Modal";
import FormPost from "../../../../../components/forms/FormPost";
import { toDateString } from "../../../../../lib/utils";
import type { SpotlightBlurbEditorItem } from "../spotlightBlurb";
import { formatDayLabel } from "../utils";

type Props = {
  week: string;
  items: SpotlightBlurbEditorItem[];
};

const SpotlightCopyModal = ({ week, items }: Props) => {
  const saveAlpineAttrs = {
    "x-target": "toast",
    "x-target.error": "toast",
    "x-on:ajax:after":
      "$el.dataset.submitMode === 'save' ? ($dispatch('dialog:close'), $dispatch('planner:updated')) : null",
  };

  if (items.length === 0) {
    return (
      <Modal title={`Spotlight copy - week ${week}`} maxWidth="max-w-3xl">
        <p class="text-sm text-on-surface">
          Schedule books of the day, artist of the week, or publisher of the
          week before editing spotlight copy.
        </p>
      </Modal>
    );
  }

  return (
    <Modal title={`Spotlight copy - week ${week}`} maxWidth="max-w-3xl">
      <div>
        <p class="mb-4 text-sm text-on-surface">
          This copy appears on spotlight pages and is used to build preview
          emails and default Instagram captions. Manual edits override
          AI-generated blurbs.
        </p>
        <FormPost
          {...saveAlpineAttrs}
          action={`/dashboard/admin/planner/spotlight-copy/${week}/prepare`}
          id={`spotlight-copy-form-${week}`}
        >
          <input type="hidden" name="week" value={week} />
          <input type="hidden" name="submitMode" value="save" />
          <div class="max-h-[min(60vh,calc(100dvh-12rem))] space-y-6 overflow-y-auto overscroll-contain pr-1">
            {items.map((item) => {
              const fieldKey =
                item.kind === "botd"
                  ? toDateString(item.date)
                  : item.kind === "artist"
                    ? "aotw"
                    : "potw";
              const title =
                item.kind === "botd"
                  ? formatDayLabel(item.date)
                  : item.kind === "artist"
                    ? "Artist of the week"
                    : "Publisher of the week";

              return (
                <SpotlightCopySection
                  key={fieldKey}
                  title={title}
                  subtitle={item.title}
                  fieldKey={fieldKey}
                  currentBlurb={item.currentBlurb}
                  sourceText={item.sourceText}
                  week={week}
                />
              );
            })}
          </div>
          <div class="mt-4 flex flex-wrap items-center gap-3 border-t border-outline pt-4">
            <button
              type="submit"
              onclick={`this.form.elements.submitMode.value='save'`}
              class="rounded border border-primary bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 cursor-pointer"
            >
              Save
            </button>
          </div>
        </FormPost>
      </div>
    </Modal>
  );
};

export default SpotlightCopyModal;

type SpotlightCopySectionProps = {
  title: string;
  subtitle: string;
  fieldKey: string;
  currentBlurb: string;
  sourceText: string | null;
  week: string;
};

const SpotlightCopySection = ({
  title,
  subtitle,
  fieldKey,
  currentBlurb,
  sourceText,
  week,
}: SpotlightCopySectionProps) => (
  <section
    class="rounded border border-outline bg-surface-alt/40 p-4"
    x-data="{ isGenerating: false }"
    {...{
      "x-on:ajax:after": "isGenerating = false",
      "x-on:ajax:error": "isGenerating = false",
    }}
  >
    <h3 class="mb-1 text-sm font-semibold text-on-surface-strong">{title}</h3>
    <p class="mb-3 text-xs text-on-surface line-clamp-2">{subtitle}</p>

    {sourceText ? (
      <details class="mb-3 text-xs text-on-surface">
        <summary class="cursor-pointer font-medium text-on-surface-strong">
          Source text
        </summary>
        <p class="mt-2 whitespace-pre-wrap rounded border border-outline/60 bg-surface p-3">
          {sourceText}
        </p>
      </details>
    ) : null}

    <label
      for={`blurbs-${fieldKey}`}
      class="mb-2 block text-xs font-medium text-on-surface"
    >
      Spotlight blurb
    </label>
    <textarea
      id={`blurbs-${fieldKey}`}
      name={`blurbs[${fieldKey}]`}
      rows={6}
      x-merge="replace"
      class="w-full rounded border border-outline bg-surface px-3 py-2 text-sm text-on-surface"
    >
      {currentBlurb}
    </textarea>
    <div class="mt-3 flex items-center gap-2">
      <button
        type="submit"
        form={`spotlight-copy-form-${week}`}
        formaction={`/dashboard/admin/planner/spotlight-copy/${week}/generate`}
        name="fieldKey"
        value={fieldKey}
        onclick={`this.form.elements.submitMode.value='generate'`}
        x-on:click="isGenerating = true"
        x-target={`toast blurbs-${fieldKey}`}
        {...{ "x-target.error": "toast" }}
        x-bind:class="isGenerating ? 'pointer-events-none opacity-60' : ''"
        x-bind:aria-busy="isGenerating"
        class="rounded border border-outline bg-surface px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-alt cursor-pointer"
      >
        <span x-show="!isGenerating">Generate blurb</span>
        <span x-show="isGenerating">Generating...</span>
      </button>
    </div>
  </section>
);
