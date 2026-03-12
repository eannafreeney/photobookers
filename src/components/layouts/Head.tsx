type HeadProps = {
  title: string;
};

const Head = ({ title }: HeadProps) => {
  const isDev = process.env.NODE_ENV !== "production";
  const gaId =
    process.env.VITE_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID;

  return (
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <meta name="view-transition" content="same-origin"></meta>
      <title>{title}</title>
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
