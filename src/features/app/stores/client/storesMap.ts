import Alpine from "alpinejs";

type StoreMapMarkerClient = {
  slug: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  href: string;
  mapsUrl: string;
};

declare global {
  interface Window {
    L?: {
      map: (
        element: HTMLElement,
        options?: { scrollWheelZoom?: boolean },
      ) => LeafletMap;
      tileLayer: (
        url: string,
        options: { attribution: string; maxZoom?: number },
      ) => { addTo: (map: LeafletMap) => void };
      marker: (
        latlng: [number, number],
      ) => {
        addTo: (map: LeafletMap) => {
          bindPopup: (html: string) => void;
        };
      };
      latLngBounds: (
        latlngs: [number, number][],
      ) => {
        isValid: () => boolean;
      };
      Icon: {
        Default: {
          prototype: { _getIconUrl?: unknown };
          mergeOptions: (options: Record<string, string>) => void;
        };
      };
    };
  }
}

type LeafletMap = {
  setView: (center: [number, number], zoom: number) => void;
  fitBounds: (
    bounds: ReturnType<NonNullable<Window["L"]>["latLngBounds"]>,
    options?: { padding: [number, number] },
  ) => void;
  remove: () => void;
};

const LEAFLET_CSS =
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

let leafletPromise: Promise<void> | null = null;

function loadStylesheet(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.crossOrigin = "";
  document.head.appendChild(link);
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function ensureLeaflet() {
  if (!leafletPromise) {
    leafletPromise = (async () => {
      loadStylesheet(LEAFLET_CSS);
      await loadScript(LEAFLET_JS);
    })();
  }
  return leafletPromise;
}

function configureLeafletIcons() {
  const L = window.L;
  if (!L) return;

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

function popupHtml(store: StoreMapMarkerClient) {
  return `
    <div style="min-width: 180px">
      <strong>${escapeHtml(store.name)}</strong>
      <p style="margin: 0.35rem 0 0; font-size: 0.85rem">${escapeHtml(store.city)}, ${escapeHtml(store.country)}</p>
      <p style="margin: 0.75rem 0 0; display: flex; gap: 0.5rem; flex-wrap: wrap">
        <a href="${escapeHtml(store.href)}">View store</a>
        <a href="${escapeHtml(store.mapsUrl)}" target="_blank" rel="noopener noreferrer">Maps</a>
      </p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function registerStoresMap() {
  Alpine.data("storesMap", (stores: StoreMapMarkerClient[]) => ({
    map: null as LeafletMap | null,
    stores,

    async init() {
      if (!this.stores.length) return;

      await ensureLeaflet();
      configureLeafletIcons();

      const L = window.L as any;
      if (!L) return;

      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      const map = L.map(this.$el, { scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const latLngs: [number, number][] = [];

      for (const store of this.stores) {
        const position: [number, number] = [store.latitude, store.longitude];
        latLngs.push(position);
        const marker = L.marker(position);
        marker.addTo(map);
        marker.bindPopup(popupHtml(store));
      }

      if (latLngs.length === 1) {
        map.setView(latLngs[0], 12);
      } else {
        const bounds = L.latLngBounds(latLngs);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [48, 48] });
        } else {
          map.setView([20, 0], 2);
        }
      }

      this.map = map;
    },
  }));
}
