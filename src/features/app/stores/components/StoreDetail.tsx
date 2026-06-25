import type { BookStore } from "../../../../db/schema";
import ExpandableDescription from "../../components/ExpandableDescription";
import Button from "../../../../components/app/Button";
import { buildGoogleMapsUrl } from "../googleMaps";
import { resolveStoreCoverUrl } from "../coverUrl";

type StoreDetailProps = {
  store: BookStore;
};

const StoreDetail = ({ store }: StoreDetailProps) => {
  const coverUrl = resolveStoreCoverUrl(store);
  const mapsUrl = buildGoogleMapsUrl(store.name, store.address);

  return (
    <div class="min-h-screen">
      {/* <div class="w-full -mt-8 mb-12">
        <div class="relative w-full h-[300px] md:h-[500px] overflow-hidden">
          <img
            src={coverUrl}
            alt={store.name}
            class="w-full h-full object-cover"
          />
        </div>
      </div> */}

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex flex-col gap-12">
        <div class="text-center space-y-6">
          <h1 class="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-on-surface-strong leading-tight">
            {store.name}
          </h1>

          <div class="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 text-on-surface">
            <div class="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full">
              <span class="text-accent">
                <MapPinIcon />
              </span>
              <span class="font-medium">
                {store.city}, {store.country}
              </span>
            </div>
            <div class="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full">
              <span class="text-accent">
                <AddressIcon />
              </span>
              <span class="font-medium">{store.address}</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block"
            >
              <Button variant="solid" color="primary">
                <span class="flex items-center gap-2">
                  Open in Google Maps
                  <ExternalLinkIcon />
                </span>
              </Button>
            </a>
            {store.website ? (
              <a
                href={store.website}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-block"
              >
                <Button variant="solid" color="inverse">
                  <span class="flex items-center gap-2">
                    Visit Website
                    <ExternalLinkIcon />
                  </span>
                </Button>
              </a>
            ) : null}
          </div>
        </div>

        {store.description ? (
          <div class="prose prose-lg max-w-none text-on-surface">
            <div class="bg-surface-container rounded-2xl">
              <ExpandableDescription text={store.description} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StoreDetail;

const MapPinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-5 h-5"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
    />
  </svg>
);

const AddressIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-5 h-5"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
    />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-4 h-4"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
    />
  </svg>
);
