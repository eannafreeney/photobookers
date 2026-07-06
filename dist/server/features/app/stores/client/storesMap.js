import Alpine from "alpinejs";
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
let leafletPromise = null;
function loadStylesheet(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.crossOrigin = "";
  document.head.appendChild(link);
}
function loadScript(src) {
  return new Promise((resolve, reject) => {
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
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  });
}
function popupHtml(store) {
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
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function registerStoresMap() {
  Alpine.data("storesMap", (stores) => ({
    map: null,
    stores,
    async init() {
      if (!this.stores.length) return;
      await ensureLeaflet();
      configureLeafletIcons();
      const L = window.L;
      if (!L) return;
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
      const map = L.map(this.$el, { scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
      }).addTo(map);
      const latLngs = [];
      for (const store of this.stores) {
        const position = [store.latitude, store.longitude];
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
    }
  }));
}
export {
  registerStoresMap
};
