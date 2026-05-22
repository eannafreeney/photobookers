export type ShareOgMeta = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
};

type HeadProps = {
  title: string;
  shareOg?: ShareOgMeta;
};

const Head = ({ title, shareOg }: HeadProps) => {
  const isDev = process.env.NODE_ENV !== "production";
  const gaId =
    process.env.VITE_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID;

  return (
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <meta name="view-transition" content="same-origin"></meta>
      <title>{title}</title>
      {shareOg?.image ? (
        <>
          <meta
            property="og:title"
            content={shareOg.title ?? title}
          />
          <meta property="og:type" content="website" />
          {shareOg.url ? (
            <meta property="og:url" content={shareOg.url} />
          ) : null}
          {shareOg.description ? (
            <meta property="og:description" content={shareOg.description} />
          ) : null}
          <meta property="og:image" content={shareOg.image} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={shareOg.title ?? title} />
          <meta name="twitter:image" content={shareOg.image} />
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
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href={isDev ? "/src/styles/styles.css" : "/styles.css"}
      />
      <script
        type="module"
        src={isDev ? "/src/client/main.js" : "/main.js"}
      ></script>
      <script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      ></script>
      {gaId && !isDev && (
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
