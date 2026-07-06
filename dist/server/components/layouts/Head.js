import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { existsSync } from "node:fs";
import { SITE_APP } from "../../constants/siteSocial.js";
const Head = ({
  title,
  description,
  canonicalUrl,
  noIndex = false,
  shareOg,
  jsonLd,
  loadDashboardScripts = false,
  loadAdminScripts = false,
  preloadLcpImage
}) => {
  const hasBuiltAssets = existsSync("./dist/client/main.js") && existsSync("./dist/client/styles.css");
  const isRunningViaViteDevServer = process.argv.some(
    (arg) => arg.includes("vite")
  );
  const useBuiltAssets = process.env.NODE_ENV === "production" && hasBuiltAssets && !isRunningViaViteDevServer;
  const stylesHref = useBuiltAssets ? "/styles.css" : "/src/styles/styles.css";
  const gaId = process.env.VITE_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID;
  const ogTitle = shareOg?.title ?? title;
  const ogDescription = shareOg?.description ?? description;
  const ogUrl = shareOg?.url ?? canonicalUrl;
  const ogImage = shareOg?.image;
  const showSocialTags = !noIndex;
  return /* @__PURE__ */ jsxs("head", { children: [
    /* @__PURE__ */ jsx("meta", { charset: "utf-8" }),
    /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width" }),
    /* @__PURE__ */ jsx("meta", { name: "view-transition", content: "same-origin" }),
    /* @__PURE__ */ jsx(
      "meta",
      {
        name: "apple-itunes-app",
        content: `app-id=${SITE_APP.ios.appStoreId}`
      }
    ),
    /* @__PURE__ */ jsx("title", { children: title }),
    noIndex ? /* @__PURE__ */ jsx("meta", { name: "robots", content: "noindex, nofollow" }) : null,
    description ? /* @__PURE__ */ jsx("meta", { name: "description", content: description }) : null,
    canonicalUrl ? /* @__PURE__ */ jsx("link", { rel: "canonical", href: canonicalUrl }) : null,
    jsonLd ? /* @__PURE__ */ jsx(
      "script",
      {
        type: "application/ld+json",
        dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) }
      }
    ) : null,
    showSocialTags ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("meta", { property: "og:title", content: ogTitle }),
      /* @__PURE__ */ jsx("meta", { property: "og:type", content: "website" }),
      ogUrl ? /* @__PURE__ */ jsx("meta", { property: "og:url", content: ogUrl }) : null,
      ogDescription ? /* @__PURE__ */ jsx("meta", { property: "og:description", content: ogDescription }) : null,
      ogImage ? /* @__PURE__ */ jsx("meta", { property: "og:image", content: ogImage }) : null,
      /* @__PURE__ */ jsx(
        "meta",
        {
          name: "twitter:card",
          content: ogImage ? "summary_large_image" : "summary"
        }
      ),
      /* @__PURE__ */ jsx("meta", { name: "twitter:title", content: ogTitle }),
      ogDescription ? /* @__PURE__ */ jsx("meta", { name: "twitter:description", content: ogDescription }) : null,
      ogImage ? /* @__PURE__ */ jsx("meta", { name: "twitter:image", content: ogImage }) : null
    ] }) : null,
    /* @__PURE__ */ jsx("link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }),
    preloadLcpImage ? /* @__PURE__ */ jsx(
      "link",
      {
        rel: "preload",
        as: "image",
        href: preloadLcpImage.preloadHref,
        imagesrcset: preloadLcpImage.srcSet,
        imagesizes: preloadLcpImage.sizes,
        fetchpriority: "high"
      }
    ) : null,
    /* @__PURE__ */ jsx("link", { rel: "stylesheet", href: stylesHref }),
    /* @__PURE__ */ jsx(
      "script",
      {
        type: "module",
        src: useBuiltAssets ? "/main.js" : "/src/client/main.js"
      }
    ),
    loadDashboardScripts ? /* @__PURE__ */ jsx(
      "script",
      {
        type: "module",
        src: useBuiltAssets ? "/dashboard.js" : "/src/client/dashboard.js"
      }
    ) : null,
    loadAdminScripts ? /* @__PURE__ */ jsx(
      "script",
      {
        type: "module",
        src: useBuiltAssets ? "/admin.js" : "/src/client/admin.js"
      }
    ) : null,
    gaId && useBuiltAssets && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "script",
        {
          async: true,
          src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`
        }
      ),
      /* @__PURE__ */ jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `
          }
        }
      )
    ] })
  ] });
};
var Head_default = Head;
export {
  Head_default as default
};
