import type { StoreMapMarker } from "../services";
import { buildGoogleMapsUrl } from "../googleMaps";

type StoresMapProps = {
  stores: StoreMapMarker[];
};

const StoresMap = ({ stores }: StoresMapProps) => {
  const markersJson = JSON.stringify(
    stores.map((store) => ({
      ...store,
      href: `/stores/${store.slug}`,
      mapsUrl: buildGoogleMapsUrl(
        store.name,
        `${store.city}, ${store.country}`,
      ),
    })),
  );

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""
      />
      <div class="flex flex-col gap-4">
        {stores.length === 0 ? (
          <div class="text-center py-12 text-on-surface-weak border-2 border-on-surface-strong rounded">
            No mapped bookstores match your filters yet.
          </div>
        ) : (
          <>
            <p class="text-sm text-on-surface-weak">
              {stores.length} bookstore{stores.length === 1 ? "" : "s"} on the
              map
            </p>
            <div
              id="stores-map"
              class="h-[min(70vh,640px)] w-full rounded border-2 border-on-surface-strong overflow-hidden z-0"
              x-data={`storesMap(${markersJson})`}
              x-init="init()"
            />
          </>
        )}
      </div>
    </>
  );
};

export default StoresMap;
