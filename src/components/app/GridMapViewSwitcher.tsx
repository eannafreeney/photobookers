type GridMapViewSwitcherProps = {
  currentView: "grid" | "map";
  basePath: string;
  query?: string;
  city?: string;
  country?: string;
  targetId?: string;
};

const GridMapViewSwitcher = ({
  currentView,
  basePath,
  query = "",
  city = "",
  country = "",
  targetId,
}: GridMapViewSwitcherProps) => {
  const sharedParams = { query, city, country };
  const gridHref = buildHref(basePath, { ...sharedParams, view: "grid" });
  const mapHref = buildHref(basePath, { ...sharedParams, view: "map" });
  const target = targetId ? { "x-target": targetId } : {};

  return (
    <div class="flex gap-2 mb-4">
      <a href={gridHref} class={viewClass(currentView === "grid")} {...target}>
        Grid View
      </a>
      <a href={mapHref} class={viewClass(currentView === "map")} {...target}>
        Map View
      </a>
    </div>
  );
};

export default GridMapViewSwitcher;

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
