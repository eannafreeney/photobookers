type FairsSearchFormProps = {
  query?: string;
  city?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  baseUrl: string;
};

const FairsSearchForm = ({
  query = "",
  city = "",
  country = "",
  startDate = "",
  endDate = "",
  baseUrl,
}: FairsSearchFormProps) => {
  return (
    <form method="get" action={baseUrl} class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 border-2 border-on-surface-strong rounded bg-surface-container-low">
        <div class="flex flex-col gap-2">
          <label
            for="query"
            class="text-sm font-medium text-on-surface-strong"
          >
            Search
          </label>
          <input
            type="text"
            id="query"
            name="query"
            value={query}
            placeholder="Name, venue..."
            class="px-3 py-2 text-sm border border-outline rounded bg-surface text-on-surface focus:border-accent focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="city" class="text-sm font-medium text-on-surface-strong">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={city}
            placeholder="e.g., Paris"
            class="px-3 py-2 text-sm border border-outline rounded bg-surface text-on-surface focus:border-accent focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label
            for="country"
            class="text-sm font-medium text-on-surface-strong"
          >
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={country}
            placeholder="e.g., France"
            class="px-3 py-2 text-sm border border-outline rounded bg-surface text-on-surface focus:border-accent focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label
            for="startDate"
            class="text-sm font-medium text-on-surface-strong"
          >
            From Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={startDate}
            class="px-3 py-2 text-sm border border-outline rounded bg-surface text-on-surface focus:border-accent focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label
            for="endDate"
            class="text-sm font-medium text-on-surface-strong"
          >
            To Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={endDate}
            class="px-3 py-2 text-sm border border-outline rounded bg-surface text-on-surface focus:border-accent focus:outline-none"
          />
        </div>

        <div class="lg:col-span-5 flex gap-2">
          <button
            type="submit"
            class="px-6 py-2 text-sm font-medium rounded bg-accent text-on-accent hover:bg-accent/90 transition-colors"
          >
            Search
          </button>
          <a
            href={baseUrl}
            class="px-6 py-2 text-sm font-medium rounded border border-outline hover:border-accent transition-colors"
          >
            Clear
          </a>
        </div>
      </div>
    </form>
  );
};

export default FairsSearchForm;
