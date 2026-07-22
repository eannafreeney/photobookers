type CampaignPreviewProps = {
  previewHtml: string;
};

const CampaignPreview = ({ previewHtml }: CampaignPreviewProps) => (
  <div
    id="newsletter-preview"
    class="rounded border border-outline bg-surface p-4"
    x-data="{ view: 'desktop', copied: false }"
  >
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-lg font-semibold text-on-surface-strong">Preview</h2>
      <div class="flex flex-wrap items-center gap-2">
        <div
          class="inline-flex rounded border border-outline bg-surface-alt p-0.5"
          role="group"
          aria-label="Preview viewport"
        >
          <button
            type="button"
            class="rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors"
            x-bind:class="view === 'desktop' ? 'bg-surface text-on-surface-strong shadow-sm' : 'text-on-surface hover:bg-surface'"
            x-on:click="view = 'desktop'"
            x-bind:aria-pressed="view === 'desktop'"
          >
            Desktop
          </button>
          <button
            type="button"
            class="rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors"
            x-bind:class="view === 'mobile' ? 'bg-surface text-on-surface-strong shadow-sm' : 'text-on-surface hover:bg-surface'"
            x-on:click="view = 'mobile'"
            x-bind:aria-pressed="view === 'mobile'"
          >
            Mobile
          </button>
        </div>
        <button
          type="button"
          class="rounded border border-outline bg-surface-alt px-3 py-2 text-sm font-medium hover:bg-surface cursor-pointer"
          x-on:click="
              const iframe = document.querySelector('iframe[title=\'Weekly newsletter preview\']');
              const source = document.getElementById('newsletter-html-source');
              const html = iframe?.getAttribute('srcdoc') ?? source?.value ?? '';
              if (html) navigator.clipboard.writeText(html);
              copied = true;
              setTimeout(() => copied = false, 2000);
            "
          x-text="copied ? 'Copied!' : 'Copy HTML'"
        />
      </div>
    </div>
    <textarea
      id="newsletter-html-source"
      class="sr-only"
      readonly
      aria-hidden="true"
      tabindex={-1}
    >
      {previewHtml}
    </textarea>
    <div
      class="overflow-auto rounded border border-outline bg-surface-alt"
      x-bind:class="view === 'mobile' ? 'flex min-h-[620px] justify-center p-4' : 'p-0'"
    >
      <iframe
        title="Weekly newsletter preview"
        srcdoc={previewHtml}
        class="h-[620px] shrink-0 rounded border border-outline bg-white"
        x-bind:class="view === 'mobile' ? 'w-[375px] max-w-full shadow-md' : 'w-full'"
      />
    </div>
  </div>
);

export default CampaignPreview;
