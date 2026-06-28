import { existsSync } from "node:fs";
import { SITE_APP } from "../../constants/siteSocial";

export type ShareOgMeta = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
};

type HeadProps = {
  title: string;
  description?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  shareOg?: ShareOgMeta;
  jsonLd?: Record<string, unknown>;
  loadAdminScripts?: boolean;
};

const Head = ({
  title,
  description,
  canonicalUrl,
  noIndex = false,
  shareOg,
  jsonLd,
  loadAdminScripts = false,
}: HeadProps) => {
  const hasBuiltAssets =
    existsSync("./dist/client/main.js") &&
    existsSync("./dist/client/styles.css");
  const isRunningViaViteDevServer = process.argv.some((arg) =>
    arg.includes("vite"),
  );
  const useBuiltAssets =
    process.env.NODE_ENV === "production" &&
    hasBuiltAssets &&
    !isRunningViaViteDevServer;
  const gaId =
    process.env.VITE_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID;

  const ogTitle = shareOg?.title ?? title;
  const ogDescription = shareOg?.description ?? description;
  const ogUrl = shareOg?.url ?? canonicalUrl;
  const ogImage = shareOg?.image;
  const showSocialTags = !noIndex;

  return (
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <meta name="view-transition" content="same-origin"></meta>
      <meta
        name="apple-itunes-app"
        content={`app-id=${SITE_APP.ios.appStoreId}`}
      />
      <title>{title}</title>
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}
      {description ? <meta name="description" content={description} /> : null}
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      {showSocialTags ? (
        <>
          <meta property="og:title" content={ogTitle} />
          <meta property="og:type" content="website" />
          {ogUrl ? <meta property="og:url" content={ogUrl} /> : null}
          {ogDescription ? (
            <meta property="og:description" content={ogDescription} />
          ) : null}
          {ogImage ? <meta property="og:image" content={ogImage} /> : null}
          <meta
            name="twitter:card"
            content={ogImage ? "summary_large_image" : "summary"}
          />
          <meta name="twitter:title" content={ogTitle} />
          {ogDescription ? (
            <meta name="twitter:description" content={ogDescription} />
          ) : null}
          {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
        </>
      ) : null}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href={useBuiltAssets ? "/styles.css" : "/src/styles/styles.css"}
      />
      <script
        type="module"
        src={useBuiltAssets ? "/main.js" : "/src/client/main.js"}
      ></script>
      {loadAdminScripts ? (
        <script
          type="module"
          src={useBuiltAssets ? "/admin.js" : "/src/client/admin.js"}
        ></script>
      ) : null}
      <script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      ></script>
      {gaId && useBuiltAssets && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `,
            }}
          />
        </>
      )}
    </head>
  );
};

export default Head;
