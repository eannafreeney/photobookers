import { jsx } from "hono/jsx/jsx-runtime";
const dispatchEvents = (events) => /* @__PURE__ */ jsx("div", { "x-sync": true, id: "server_events", children: /* @__PURE__ */ jsx("div", { "x-init": events.map((e) => `$dispatch('${e}')`).join("; ") }) });
export {
  dispatchEvents
};
