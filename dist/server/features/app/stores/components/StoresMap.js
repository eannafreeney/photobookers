import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { buildGoogleMapsUrl } from "../googleMaps.js";
const StoresMap = ({ stores }) => {
  const markersJson = JSON.stringify(
    stores.map((store) => ({
      ...store,
      href: `/stores/${store.slug}`,
      mapsUrl: buildGoogleMapsUrl(
        store.name,
        `${store.city}, ${store.country}`
      )
    }))
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "link",
      {
        rel: "stylesheet",
        href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
        integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
        crossorigin: ""
      }
    ),
    /* @__PURE__ */ jsx("div", { class: "flex flex-col gap-4", children: stores.length === 0 ? /* @__PURE__ */ jsx("div", { class: "text-center py-12 text-on-surface-weak border-2 border-on-surface-strong rounded", children: "No mapped bookstores match your filters yet." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("p", { class: "text-sm text-on-surface-weak", children: [
        stores.length,
        " bookstore",
        stores.length === 1 ? "" : "s",
        " on the map"
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          id: "stores-map",
          class: "h-[min(70vh,640px)] w-full rounded border-2 border-on-surface-strong overflow-hidden z-0",
          "x-data": `storesMap(${markersJson})`,
          "x-init": "init()"
        }
      )
    ] }) })
  ] });
};
var StoresMap_default = StoresMap;
export {
  StoresMap_default as default
};
