type StoresSearchFormProps = {
  query?: string;
  city?: string;
  country?: string;
  countries: string[];
  baseUrl: string;
  view?: "grid" | "map";
};

const StoresSearchForm = ({
  query = "",
  city = "",
  country = "",
  countries,
  baseUrl,
  view = "grid",
}: StoresSearchFormProps) => {
  return (
    <form method="get" action={baseUrl} class="mb-6">
      {view === "map" ? <input type="hidden" name="view" value="map" /> : null}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-2 border-on-surface-strong rounded bg-surface-container-low">
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
            placeholder="Name, address..."
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
          <select
            id="country"
            name="country"
            class="px-3 py-2 text-sm border border-outline rounded bg-surface text-on-surface focus:border-accent focus:outline-none"
          >
            <option value="">All countries</option>
            {countries.map((countryName) => (
              <option
                key={countryName}
                value={countryName}
                selected={country === countryName}
              >
                {countryName}
              </option>
            ))}
          </select>
        </div>

        <div class="flex items-end gap-2">
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

export default StoresSearchForm;
