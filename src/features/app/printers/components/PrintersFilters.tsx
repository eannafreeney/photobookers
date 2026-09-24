type Props = {
  countries: string[];
  languages: string[];
  country: string;
  language: string;
};

const PrintersFilters = ({ countries, languages, country, language }: Props) => {
  return (
    <form method="get" action="/printers" class="flex flex-wrap items-end gap-3">
      <label class="flex flex-col gap-1 text-sm">
        Country
        <select
          name="country"
          class="px-3 py-2 text-sm border border-outline rounded bg-surface"
        >
          <option value="">All countries</option>
          {countries.map((name) => (
            <option value={name} selected={country === name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Language
        <select
          name="language"
          class="px-3 py-2 text-sm border border-outline rounded bg-surface"
        >
          <option value="">All languages</option>
          {languages.map((name) => (
            <option value={name} selected={language === name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        class="px-4 py-2 text-sm font-medium rounded bg-accent text-on-accent"
      >
        Filter
      </button>
      <a href="/printers" class="px-4 py-2 text-sm border border-outline rounded">
        Clear
      </a>
    </form>
  );
};

export default PrintersFilters;

export function printerLanguages(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((language) => language.trim())
    .filter(Boolean);
}
