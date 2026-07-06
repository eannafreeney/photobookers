import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Head from "./Head.js";
import { UserProvider } from "../../contexts/UserContext.js";
import Navbar from "./Navbar.js";
import Footer from "../app/Footer.js";
import Alert from "../app/Alert.js";
import PreviewBanner from "../app/PreviewBanner.js";
import Dock from "./Dock.js";
import ToastContainer from "../app/ToastContainer.js";
import ActivityStream from "../app/ActivityStream.js";
import { fadeTransition } from "../../lib/transitions.js";
function needsDashboardScripts(path) {
  if (!path) return false;
  if (path.startsWith("/dashboard/admin")) return false;
  if (path.startsWith("/dashboard")) return true;
  if (path.startsWith("/stores")) return true;
  if (path.startsWith("/interviews/") && !path.startsWith("/interviews/view")) {
    return true;
  }
  if (/^\/users\/[^/]+\/update$/.test(path)) return true;
  return false;
}
const AppLayout = ({
  title = "photobookers",
  description,
  canonicalUrl,
  noIndex,
  children,
  user,
  currentPath,
  flash,
  isPreview = false,
  adminEditHref,
  shareOg,
  jsonLd,
  preloadLcpImage
}) => {
  const loadDashboardScripts = needsDashboardScripts(currentPath);
  const loadAdminScripts = currentPath?.startsWith("/dashboard/admin") ?? false;
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx(
      Head,
      {
        title,
        description,
        canonicalUrl,
        noIndex: noIndex ?? currentPath?.startsWith("/dashboard"),
        shareOg,
        jsonLd,
        loadDashboardScripts,
        loadAdminScripts,
        preloadLcpImage
      }
    ),
    /* @__PURE__ */ jsxs("body", { class: "bg-surface", children: [
      /* @__PURE__ */ jsxs(UserProvider, { user, children: [
        isPreview && /* @__PURE__ */ jsx(PreviewBanner, {}),
        /* @__PURE__ */ jsx(
          Navbar,
          {
            currentPath,
            user,
            adminEditHref
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            class: "pb-0",
            "x-data": "{\n            show: false,\n            init() {\n                window.addEventListener('scroll', () => {\n                    this.show = window.scrollY > 300\n                })\n            }\n        }",
            children: [
              /* @__PURE__ */ jsx("main", { class: "min-h-60vh mx-auto w-full max-w-[1680px] px-4 md:px-8", children }),
              /* @__PURE__ */ jsx(Footer, {}),
              /* @__PURE__ */ jsx(ScrollToTopButton, {}),
              /* @__PURE__ */ jsx(Dock, { currentPath })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { id: "modal-root" }),
      flash && /* @__PURE__ */ jsx(Alert, { type: flash.type, message: flash.message }),
      /* @__PURE__ */ jsx(ToastContainer, {}),
      user ? /* @__PURE__ */ jsx(ActivityStream, { currentUserId: user.id }) : null,
      /* @__PURE__ */ jsx("div", { "x-sync": true, id: "server_events" })
    ] })
  ] });
};
var AppLayout_default = AppLayout;
const ScrollToTopButton = () => {
  return /* @__PURE__ */ jsx(
    "button",
    {
      "x-show": "show",
      ...fadeTransition,
      "x-on:click": "window.scrollTo({ top: 0, behavior: 'smooth' })",
      class: "fixed bottom-20 right-5 bg-on-surface-strong text-surface px-4 py-3 shadow-lg opacity-60 cursor-pointer hover:opacity-100 transition-opacity duration-300",
      children: "\u2191"
    }
  );
};
export {
  AppLayout_default as default
};
