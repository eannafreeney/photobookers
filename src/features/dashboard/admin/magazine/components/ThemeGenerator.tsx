const ThemeGenerator = () => (
  <form
    method="post"
    action="/dashboard/admin/magazine/generate"
    class="flex flex-col gap-3 border border-on-surface-strong bg-surface-alt p-4 sm:flex-row sm:items-end"
    x-data="{ loading: false }"
    x-on:submit="loading = true"
  >
    <label class="flex flex-1 flex-col gap-1">
      <span class="kicker text-on-surface">Theme seed (optional)</span>
      <input
        type="text"
        name="seed"
        placeholder="e.g. water, ritual, the city at night — or leave blank to surprise"
        class="w-full border border-outline bg-surface px-3 py-2 text-sm text-on-surface"
      />
    </label>
    <button
      type="submit"
      x-bind:disabled="loading"
      class="border border-accent bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent/90 disabled:opacity-60"
    >
      <span x-show="!loading">✨ Generate draft</span>
      <span x-show="loading" x-cloak>
        Generating… (up to a minute)
      </span>
    </button>
  </form>
);

export default ThemeGenerator;
