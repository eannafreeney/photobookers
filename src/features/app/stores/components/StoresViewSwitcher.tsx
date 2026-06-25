type StoresViewSwitcherProps = {
  currentView: "grid" | "map";
  basePath: string;
  query?: string;
  city?: string;
  country?: string;
};

const StoresViewSwitcher = ({
  currentView,
  basePath,
  query = "",
  city = "",
  country = "",
}: StoresViewSwitcherProps) => {
  const sharedParams = { query, city, country };
  const gridHref = buildHref(basePath, { ...sharedParams, view: "grid" });
  const mapHref = buildHref(basePath, { ...sharedParams, view: "map" });

  return (
    <div class="flex gap-2 mb-4">
      <a
        href={gridHref}
        x-target="stores-content"
        class={viewClass(currentView === "grid")}
      >
        Grid View
      </a>
      <a
        href={mapHref}
        x-target="stores-content"
        class={viewClass(currentView === "map")}
      >
        Map View
      </a>
    </div>
  );
};

export default StoresViewSwitcher;

const viewClass = (active: boolean) =>
  `px-4 py-2 text-sm rounded border transition-colors ${
    active
      ? "border-accent bg-accent text-on-accent"
      : "border-outline hover:border-accent"
  }`;

function buildHref(
  basePath: string,
  params: {
    view: "grid" | "map";
    query?: string;
    city?: string;
    country?: string;
  },
) {
  const search = new URLSearchParams();
  if (params.view !== "grid") search.set("view", params.view);
  if (params.query) search.set("query", params.query);
  if (params.city) search.set("city", params.city);
  if (params.country) search.set("country", params.country);
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}
